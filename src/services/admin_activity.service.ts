import pool from "../config/db";

type JsonObject = Record<string, any>;

export interface CreateAdminActivityLogInput {
  adminUserId?: number | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  pageKey?: string | null;
  changedFields?: string[];
  metadata?: JsonObject;
}

export interface AdminActivityListFilters {
  action?: string;
  entityType?: string;
  entityId?: number;
  adminUserId?: number;
  actorRole?: string;
  fromDate?: string;
  toDate?: string;
}

const isPlainObject = (value: unknown): value is JsonObject =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeScalar = (value: unknown): unknown => {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    const trimmed = value.trim();
    const lowered = trimmed.toLowerCase();

    if (lowered === "true") return true;
    if (lowered === "false") return false;

    if (trimmed !== "" && !Number.isNaN(Number(trimmed))) {
      return Number(trimmed);
    }
    return trimmed;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return value;
  }

  return value;
};

const valuesEqual = (a: unknown, b: unknown) => {
  const normalizedA = normalizeScalar(a);
  const normalizedB = normalizeScalar(b);

  if (normalizedA === normalizedB) return true;
  return JSON.stringify(normalizedA) === JSON.stringify(normalizedB);
};

const buildDiff = (
  before: unknown,
  after: unknown,
  path = ""
): Record<string, { old: unknown; new: unknown }> => {
  if (valuesEqual(before, after)) return {};

  const beforeIsObject = isPlainObject(before);
  const afterIsObject = isPlainObject(after);

  if (beforeIsObject && afterIsObject) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const nested: Record<string, { old: unknown; new: unknown }> = {};
    keys.forEach((key) => {
      const keyPath = path ? `${path}.${key}` : key;
      Object.assign(nested, buildDiff(before[key], after[key], keyPath));
    });
    return nested;
  }

  const beforeIsArray = Array.isArray(before);
  const afterIsArray = Array.isArray(after);
  if (beforeIsArray || afterIsArray) {
    return {
      [path || "value"]: { old: before, new: after },
    };
  }

  return {
    [path || "value"]: { old: before, new: after },
  };
};

export const createAdminActivityLog = async (
  input: CreateAdminActivityLogInput
) => {
  await pool.query(
    `INSERT INTO editor_activity_logs
      (admin_user_id, actor_role, action, entity_type, entity_id, page_key, changed_fields, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.adminUserId ?? null,
      input.actorRole ?? null,
      input.action,
      input.entityType,
      input.entityId ?? null,
      input.pageKey ?? null,
      input.changedFields ? JSON.stringify(input.changedFields) : null,
      input.metadata ? JSON.stringify(input.metadata) : null,
    ]
  );
};

export const logEntityUpdate = async ({
  adminUserId,
  actorRole,
  entityType,
  entityId,
  pageKey,
  before,
  after,
  forcedFieldChanges,
  excludeExactFields,
  excludeFieldPrefixes,
  metadata,
}: {
  adminUserId?: number | null;
  actorRole?: string | null;
  entityType: string;
  entityId?: number | null;
  pageKey?: string | null;
  before: unknown;
  after: unknown;
  forcedFieldChanges?: Record<string, { old: unknown; new: unknown }>;
  excludeExactFields?: string[];
  excludeFieldPrefixes?: string[];
  metadata?: JsonObject;
}) => {
  const diff = buildDiff(before, after);

  const shouldExclude = (field: string) => {
    if (excludeExactFields?.includes(field)) return true;
    if (excludeFieldPrefixes?.some((prefix) => field.startsWith(prefix))) {
      return true;
    }
    return false;
  };

  Object.keys(diff).forEach((field) => {
    if (shouldExclude(field)) {
      delete diff[field];
    }
  });

  if (forcedFieldChanges && isPlainObject(forcedFieldChanges)) {
    Object.entries(forcedFieldChanges).forEach(([field, change]) => {
      if (!diff[field]) {
        diff[field] = change;
      }
    });
  }
  const changedFields = Object.keys(diff);

  if (!changedFields.length) return;

  await createAdminActivityLog({
    adminUserId,
    actorRole,
    action: "update",
    entityType,
    entityId,
    pageKey,
    changedFields,
    metadata: {
      ...(metadata || {}),
      diff,
    },
  });
};

/** Persists dirty field paths submitted by the CMS after a successful save (mentor-only at controller). */
export const logEditorActivityFromClient = async ({
  adminUserId,
  actorRole,
  entityType,
  entityId,
  pageKey,
  changedFields,
  metadata,
}: {
  adminUserId?: number | null;
  actorRole?: string | null;
  entityType: string;
  entityId: number;
  pageKey?: string | null;
  changedFields: string[];
  metadata?: JsonObject;
}) => {
  const unique = [...new Set(changedFields.map((p) => String(p).trim()).filter(Boolean))];
  if (!unique.length) return;

  await createAdminActivityLog({
    adminUserId,
    actorRole,
    action: "update",
    entityType,
    entityId,
    pageKey: pageKey ?? null,
    changedFields: unique,
    metadata: {
      ...(metadata || {}),
      source: "client_dirty_paths",
      paths: unique,
    },
  });
};

export const listAdminActivityLogs = async (
  page = 1,
  limit = 20,
  filters: AdminActivityListFilters = {}
) => {
  const offset = (page - 1) * limit;
  const where: string[] = ["1=1"];
  const params: any[] = [];

  if (filters.action) {
    where.push("action = ?");
    params.push(filters.action);
  }
  if (filters.entityType) {
    where.push("entity_type = ?");
    params.push(filters.entityType);
  }
  if (filters.entityId) {
    where.push("entity_id = ?");
    params.push(filters.entityId);
  }
  if (filters.adminUserId) {
    where.push("admin_user_id = ?");
    params.push(filters.adminUserId);
  }
  if (filters.actorRole) {
    where.push("actor_role = ?");
    params.push(filters.actorRole);
  }
  if (filters.fromDate) {
    where.push("DATE(created_at) >= DATE(?)");
    params.push(filters.fromDate);
  }
  if (filters.toDate) {
    where.push("DATE(created_at) <= DATE(?)");
    params.push(filters.toDate);
  }

  const whereClause = `WHERE ${where.join(" AND ")}`;

  const [rows]: any = await pool.query(
    `SELECT
      l.id,
      l.admin_user_id,
      u.name AS admin_user_name,
      l.actor_role,
      l.action,
      l.entity_type,
      l.entity_id,
      COALESCE(uni.university_name, uc.name, ucs.name) AS entity_name,
      l.page_key,
      l.changed_fields,
      l.metadata,
      l.created_at
     FROM editor_activity_logs l
     LEFT JOIN users u ON u.id = l.admin_user_id
     LEFT JOIN universities uni
       ON l.entity_type = 'university' AND uni.id = l.entity_id
     LEFT JOIN university_courses uc
       ON l.entity_type = 'university_course' AND uc.id = l.entity_id
     LEFT JOIN university_course_specialization ucs
       ON l.entity_type = 'university_course_specialization' AND ucs.id = l.entity_id
     ${whereClause}
     ORDER BY l.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows]: any = await pool.query(
    `SELECT COUNT(*) AS total
     FROM editor_activity_logs
     ${whereClause}`,
    params
  );

  const data = rows.map((row: any) => ({
    ...row,
    changed_fields:
      typeof row.changed_fields === "string"
        ? JSON.parse(row.changed_fields || "[]")
        : row.changed_fields || [],
    metadata:
      typeof row.metadata === "string"
        ? JSON.parse(row.metadata || "{}")
        : row.metadata || {},
  }));

  const total = countRows?.[0]?.total ?? 0;

  return {
    data,
    page,
    limit,
    total,
    pages: limit ? Math.ceil(total / limit) : 1,
  };
};
