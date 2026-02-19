import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";

const safeParseJsonArray = (value: any): number[] => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed.map((v) => Number(v)).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
};

export interface Course {
  id: number;
  domain_id: number;
  name: string;
  slug: string;
  h1Tag?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  label?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  course_duration?: string | null;
  duration_for_schema?: string | null; // JSON string
  eligibility?: string | null;
  eligibility_info?: string | null;
  upload_brochure?: string | null;
  author_name?: string | null;
  learning_mode?: string | null;
  podcast_embed?: string | null;
  emi_facility?: boolean | null;
  priority?: number | null;
  menu_visibility?: boolean;
  is_active?: boolean;
  placement_partner_ids?: number[] | null;
  emi_partner_ids?: number[] | null;
  created_at?: Date;
  updated_at?: Date;
}

export default class CourseRepo {
  private getExecutor(conn?: Pool | PoolConnection) {
    return conn || pool;
  }

  private mapRow(row: any) {
    if (!row) return row;
    const placementIds =
      row.placement_partner_ids && typeof row.placement_partner_ids === "string"
        ? safeParseJsonArray(row.placement_partner_ids)
        : Array.isArray(row.placement_partner_ids)
        ? row.placement_partner_ids
        : [];
    const emiIds =
      row.emi_partner_ids && typeof row.emi_partner_ids === "string"
        ? safeParseJsonArray(row.emi_partner_ids)
        : Array.isArray(row.emi_partner_ids)
        ? row.emi_partner_ids
        : [];
    // Parse duration_for_schema JSON string to object
    let durationForSchema = null;
    if (row.duration_for_schema) {
      try {
        durationForSchema = typeof row.duration_for_schema === 'string' 
          ? JSON.parse(row.duration_for_schema) 
          : row.duration_for_schema;
      } catch (e) {
        console.error('Error parsing duration_for_schema:', e);
      }
    }

    return {
      ...row,
      duration_for_schema: durationForSchema, // Return as object, not string
      placement_partner_ids: placementIds,
      emi_partner_ids: emiIds,
      emi_facility:
        row.emi_facility === null || row.emi_facility === undefined
          ? false
          : Boolean(row.emi_facility),
      is_active:
        row.is_active === null || row.is_active === undefined ? true : Boolean(row.is_active),
      menu_visibility:
        row.menu_visibility === null || row.menu_visibility === undefined
          ? true
          : Boolean(row.menu_visibility),
    };
  }

  async findAll(page = 1, limit = 20, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const offset = (page - 1) * limit;

    const [rows]: any = await executor.query(
      `
    SELECT 
      c.*, 
      d.name AS domain_name,
      d.slug AS domain_slug
    FROM courses c
    LEFT JOIN domains d ON c.domain_id = d.id
    ORDER BY c.priority ASC, c.updated_at DESC
    LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );

    const [countRows]: any = await executor.query(
      "SELECT COUNT(*) as total FROM courses"
    );
    const total = countRows[0]?.total ?? 0;
    return {
      data: rows.map((row: any) => this.mapRow(row)),
      page,
      pages: Math.ceil(total / limit),
      total,
    };
  }

  async findAllCourseName(conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query(
      "SELECT id, name FROM courses ORDER BY name ASC"
    );
    return rows;
  }

  async findByDomainGrouped(conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query(
      `SELECT 
        c.id,
        c.name,
        c.thumbnail,
        c.slug,
        c.course_duration,
        c.label,
        d.slug AS domain_slug,
        d.name AS domain_name,
        d.label AS domain_label,
        COUNT(s.id) AS specialization_count
      FROM courses c
      INNER JOIN domains d ON c.domain_id = d.id
      LEFT JOIN specializations s ON c.id = s.course_id
      WHERE c.is_active = 1 AND c.menu_visibility = 1
      GROUP BY c.id, c.name, c.thumbnail, c.slug, c.course_duration, c.label, d.slug, d.name, d.label 
      ORDER BY d.priority ASC, c.priority ASC, c.name ASC`
    );
    return rows;
  }

  async findById(id: number, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query("SELECT * FROM courses WHERE id = ?", [
      id,
    ]);
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async findBySlug(slug: string, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query("SELECT * FROM courses WHERE slug = ?", [
      slug,
    ]);
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async create(item: Partial<Course>, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const menuVisibility =
      item.menu_visibility === undefined ? true : item.menu_visibility;
    const isActive =
      item.is_active === undefined ? true : item.is_active;

    const [result]: any = await executor.query(
      `INSERT INTO courses 
        (domain_id, name, slug, h1Tag, meta_title, meta_description, label, thumbnail, description, course_duration, duration_for_schema, eligibility, eligibility_info, upload_brochure, author_name, learning_mode, podcast_embed, emi_facility, priority, menu_visibility, is_active, placement_partner_ids, emi_partner_ids)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.domain_id,
        item.name,
        item.slug,
        item.h1Tag ?? null,
        item.meta_title ?? null,
        item.meta_description ?? null,
        item.label ?? null,
        item.thumbnail ?? null,
        item.description ?? null,
        item.course_duration ?? null,
        item.duration_for_schema ?? null,
        item.eligibility ?? null,
        item.eligibility_info ?? null,
        item.upload_brochure ?? null,
        item.author_name ?? null,
        item.learning_mode ?? null,
        item.podcast_embed ?? null,
        item.emi_facility ?? null,
        item.priority ?? 0,
        menuVisibility ? 1 : 0,
        isActive ? 1 : 0,
        item.placement_partner_ids ? JSON.stringify(item.placement_partner_ids) : null,
        item.emi_partner_ids ? JSON.stringify(item.emi_partner_ids) : null,
      ]
    );
    return this.findById(result.insertId, conn);
  }

  async update(
    id: number,
    item: Partial<Course>,
    saveWithDate = true,
    conn?: Pool | PoolConnection
  ) {
    const executor = this.getExecutor(conn);
    const fields: string[] = [];
    const values: any[] = [];

    if (item.domain_id !== undefined) {
      fields.push("domain_id = ?");
      values.push(item.domain_id);
    }
    if (item.name !== undefined) {
      fields.push("name = ?");
      values.push(item.name);
    }
    if (item.slug !== undefined) {
      fields.push("slug = ?");
      values.push(item.slug);
    }
    if (item.h1Tag !== undefined) {
      fields.push("h1Tag = ?");
      values.push(item.h1Tag ?? null);
    }
    if (item.meta_title !== undefined) {
      fields.push("meta_title = ?");
      values.push(item.meta_title ?? null);
    }
    if (item.meta_description !== undefined) {
      fields.push("meta_description = ?");
      values.push(item.meta_description ?? null);
    }
    if (item.label !== undefined) {
      fields.push("label = ?");
      values.push(item.label ?? null);
    }
    if (item.thumbnail !== undefined) {
      fields.push("thumbnail = ?");
      values.push(item.thumbnail ?? null);
    }
    if (item.description !== undefined) {
      fields.push("description = ?");
      values.push(item.description ?? null);
    }
    if (item.course_duration !== undefined) {
      fields.push("course_duration = ?");
      values.push(item.course_duration ?? null);
    }
    if (item.duration_for_schema !== undefined) {
      fields.push("duration_for_schema = ?");
      values.push(item.duration_for_schema ?? null);
    }
    if (item.eligibility !== undefined) {
      fields.push("eligibility = ?");
      values.push(item.eligibility ?? null);
    }
    if (item.eligibility_info !== undefined) {
      fields.push("eligibility_info = ?");
      values.push(item.eligibility_info ?? null);
    }
    if (item.upload_brochure !== undefined) {
      fields.push("upload_brochure = ?");
      values.push(item.upload_brochure ?? null);
    }
    if (item.author_name !== undefined) {
      fields.push("author_name = ?");
      values.push(item.author_name ?? null);
    }
    if (item.learning_mode !== undefined) {
      fields.push("learning_mode = ?");
      values.push(item.learning_mode ?? null);
    }
    if (item.podcast_embed !== undefined) {
      fields.push("podcast_embed = ?");
      values.push(item.podcast_embed ?? null);
    }
    if (item.emi_facility !== undefined) {
      fields.push("emi_facility = ?");
      values.push(
        item.emi_facility === null || item.emi_facility === undefined
          ? null
          : item.emi_facility
      );
    }
    if (item.placement_partner_ids !== undefined) {
      fields.push("placement_partner_ids = ?");
      values.push(
        item.placement_partner_ids === null
          ? null
          : JSON.stringify(item.placement_partner_ids)
      );
    }
    if (item.emi_partner_ids !== undefined) {
      fields.push("emi_partner_ids = ?");
      values.push(
        item.emi_partner_ids === null ? null : JSON.stringify(item.emi_partner_ids)
      );
    }
    if (item.menu_visibility !== undefined) {
      fields.push("menu_visibility = ?");
      values.push(item.menu_visibility ? 1 : 0);
    }
    if (item.is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(item.is_active ? 1 : 0);
    }
    if (item.priority !== undefined) {
      fields.push("priority = ?");
      values.push(item.priority ?? 0);
    }

    if (!fields.length) return null;
    if (saveWithDate) {
      fields.push("updated_at = NOW()");
    } else {
      // Prevent MySQL's ON UPDATE CURRENT_TIMESTAMP from auto-updating
      fields.push("updated_at = updated_at");
    }

    values.push(id);
    const [result]: any = await executor.query(
      `UPDATE courses SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;

    return this.findById(id, conn);
  }

  async delete(id: number, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [result]: any = await executor.query("DELETE FROM courses WHERE id = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  }
}