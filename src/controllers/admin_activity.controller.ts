import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utills/response";
import {
  listAdminActivityLogs,
  logEditorActivityFromClient,
} from "../services/admin_activity.service";

export const createFromClient = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const role = String(user?.role ?? "").toLowerCase();
    if (role !== "mentor") {
      return errorResponse(res, "Only editors with mentor role can log activity", 403);
    }

    const {
      entity_type: entityType,
      entity_id: entityId,
      page_key: pageKey,
      changed_fields: changedFields,
    } = req.body;

    await logEditorActivityFromClient({
      adminUserId: user?.id ?? null,
      actorRole: user?.role ?? null,
      entityType,
      entityId,
      pageKey: pageKey ?? null,
      changedFields,
      metadata: {
        source: "client_dirty_paths",
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        user_agent: req.headers["user-agent"] || null,
      },
    });

    return successResponse(res, { logged: true }, "Editor activity logged", 201);
  } catch (error: any) {
    console.error("❌ Error creating editor activity log:", error);
    return errorResponse(
      res,
      error?.message || "Failed to log editor activity",
      500
    );
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;

    const action =
      typeof req.query.action === "string" ? req.query.action.trim() : undefined;
    const entityType =
      typeof req.query.entity_type === "string"
        ? req.query.entity_type.trim()
        : undefined;
    const entityId = req.query.entity_id ? Number(req.query.entity_id) : undefined;
    const adminUserId = req.query.admin_user_id
      ? Number(req.query.admin_user_id)
      : undefined;
    const actorRole =
      typeof req.query.actor_role === "string"
        ? req.query.actor_role.trim()
        : undefined;
    const fromDate =
      typeof req.query.fromDate === "string"
        ? req.query.fromDate.trim()
        : undefined;
    const toDate =
      typeof req.query.toDate === "string" ? req.query.toDate.trim() : undefined;

    const result = await listAdminActivityLogs(page, limit, {
      action,
      entityType,
      entityId: entityId && !Number.isNaN(entityId) ? entityId : undefined,
      adminUserId:
        adminUserId && !Number.isNaN(adminUserId) ? adminUserId : undefined,
      actorRole,
      fromDate,
      toDate,
    });

    return successResponse(res, result, "Admin activity logs fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching admin activity logs:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch admin activity logs",
      500
    );
  }
};
