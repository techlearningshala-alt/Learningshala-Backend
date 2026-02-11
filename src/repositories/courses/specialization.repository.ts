import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";
import { Specialization } from "../../models/courses/specializations.model";

const safeParseJsonArray = (value: any): number[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export default class SpecializationRepo {
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
      is_active:
        row.is_active === null || row.is_active === undefined ? true : Boolean(row.is_active),
      menu_visibility:
        row.menu_visibility === null || row.menu_visibility === undefined
          ? true
          : Boolean(row.menu_visibility),
      emi_facility: row.emi_facility === null || row.emi_facility === undefined ? false : Boolean(row.emi_facility),
    };
  }

  async findAll(page = 1, limit = 10, filters?: { search?: string; course_id?: number }, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const offset = (page - 1) * limit;

    let whereClause = "";
    const queryParams: any[] = [];

    if (filters) {
      const conditions: string[] = [];
      
      if (filters.search) {
        conditions.push("s.name LIKE ?");
        queryParams.push(`%${filters.search}%`);
      }
      
      if (filters.course_id) {
        conditions.push("s.course_id = ?");
        queryParams.push(filters.course_id);
      }
      
      if (conditions.length > 0) {
        whereClause = "WHERE " + conditions.join(" AND ");
      }
    }

    const [rows]: any = await executor.query(
      `SELECT SQL_CALC_FOUND_ROWS s.*, c.name AS course_name
     FROM specializations s
     LEFT JOIN courses c ON s.course_id = c.id
     ${whereClause}
     ORDER BY s.priority ASC, s.updated_at DESC 
     LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const [[{ "FOUND_ROWS()": total }]]: any = await executor.query("SELECT FOUND_ROWS()");

    return { data: rows.map((row: any) => this.mapRow(row)), page, pages: Math.ceil(total / limit), total };
  }

  async findById(id: number, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query(
      `SELECT s.*, c.slug AS course_slug
       FROM specializations s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.id = ?`,
      [id]
    );
    console.log("rows", rows);
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async create(item: Partial<Specialization>, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const menuVisibility =
      item.menu_visibility === undefined ? true : item.menu_visibility;
    const isActive =
      item.is_active === undefined ? true : item.is_active;

    const [result]: any = await executor.query(
      `INSERT INTO specializations 
        (course_id, name, slug, h1Tag, meta_title, meta_description, label, thumbnail, description, course_duration, duration_for_schema, eligibility, eligibility_info, upload_brochure, author_name, learning_mode, podcast_embed, priority, menu_visibility, is_active, placement_partner_ids, emi_facility)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.course_id,
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
        item.priority ?? 0,
        menuVisibility ? 1 : 0,
        isActive ? 1 : 0,
        item.placement_partner_ids ? JSON.stringify(item.placement_partner_ids) : null,
        item.emi_facility === undefined || item.emi_facility === null ? 0 : (item.emi_facility ? 1 : 0),
      ]
    );
    return this.findById(result.insertId, conn);
  }

  async update(id: number, item: Partial<Specialization>, saveWithDate = true, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const fields: string[] = [];
    const values: any[] = [];

    if (item.course_id !== undefined) { fields.push("course_id = ?"); values.push(item.course_id); }
    if (item.name !== undefined) { fields.push("name = ?"); values.push(item.name); }
    if (item.slug !== undefined) { fields.push("slug = ?"); values.push(item.slug); }
    if (item.h1Tag !== undefined) { fields.push("h1Tag = ?"); values.push(item.h1Tag ?? null); }
    if (item.meta_title !== undefined) { fields.push("meta_title = ?"); values.push(item.meta_title ?? null); }
    if (item.meta_description !== undefined) { fields.push("meta_description = ?"); values.push(item.meta_description ?? null); }
    if (item.label !== undefined) { fields.push("label = ?"); values.push(item.label ?? null); }
    if (item.thumbnail !== undefined) { fields.push("thumbnail = ?"); values.push(item.thumbnail ?? null); }
    if (item.description !== undefined) { fields.push("description = ?"); values.push(item.description ?? null); }
    if (item.course_duration !== undefined) { fields.push("course_duration = ?"); values.push(item.course_duration ?? null); }
    if (item.duration_for_schema !== undefined) { fields.push("duration_for_schema = ?"); values.push(item.duration_for_schema ?? null); }
    if (item.eligibility !== undefined) { fields.push("eligibility = ?"); values.push(item.eligibility ?? null); }
    if (item.eligibility_info !== undefined) { fields.push("eligibility_info = ?"); values.push(item.eligibility_info ?? null); }
    if (item.upload_brochure !== undefined) { fields.push("upload_brochure = ?"); values.push(item.upload_brochure ?? null); }
    if (item.author_name !== undefined) { fields.push("author_name = ?"); values.push(item.author_name ?? null); }
    if (item.emi_facility !== undefined) { fields.push("emi_facility = ?"); values.push(item.emi_facility === null ? 0 : (item.emi_facility ? 1 : 0)); }
    if (item.learning_mode !== undefined) { fields.push("learning_mode = ?"); values.push(item.learning_mode ?? null); }
    if (item.podcast_embed !== undefined) { fields.push("podcast_embed = ?"); values.push(item.podcast_embed ?? null); }
    if (item.menu_visibility !== undefined) { fields.push("menu_visibility = ?"); values.push(item.menu_visibility ? 1 : 0); }
    if (item.is_active !== undefined) { fields.push("is_active = ?"); values.push(item.is_active ? 1 : 0); }
    if (item.priority !== undefined) { fields.push("priority = ?"); values.push(item.priority ?? 0); }
    if (item.placement_partner_ids !== undefined) {
      fields.push("placement_partner_ids = ?");
      values.push(
        item.placement_partner_ids === null
          ? null
          : JSON.stringify(item.placement_partner_ids)
      );
    }

    if (!fields.length) return null;
    if (saveWithDate) {
      fields.push("updated_at = NOW()");
    } else {
      // Prevent MySQL's ON UPDATE CURRENT_TIMESTAMP from auto-updating
      fields.push("updated_at = updated_at");
    }

    values.push(id);
    const [result]: any = await executor.query(`UPDATE specializations SET ${fields.join(", ")} WHERE id = ?`, values);

    if (result.affectedRows === 0) return null;

    return this.findById(id, conn);
  }

  async findSpecializationDataByCourseId(courseId: number, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query(
      `SELECT name, slug, course_duration AS duration
       FROM specializations
       WHERE course_id = ? AND is_active = 1 AND menu_visibility = 1
       ORDER BY priority ASC, id ASC`,
      [courseId]
    );
    return rows || [];
  }

  async findByCourseSlugAndSpecializationSlug(
    courseSlug: string,
    specializationSlug: string,
    conn?: Pool | PoolConnection
  ) {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query(
      `SELECT s.*
       FROM specializations s
       INNER JOIN courses c ON s.course_id = c.id
       WHERE c.slug = ? AND s.slug = ?
       LIMIT 1`,
      [courseSlug, specializationSlug]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async delete(id: number, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [result]: any = await executor.query("DELETE FROM specializations WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
