import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";

export interface Course {
  id: number;
  domain_id: number;
  name: string;
  slug: string;
  h1Tag?: string | null;
  label?: string | null;
  thumbnail?: string | null;
  description?: string | null;
  course_duration?: string | null;
  upload_brochure?: string | null;
  author_name?: string | null;
  learning_mode?: string | null;
  podcast_embed?: string | null;
  priority?: number | null;
  menu_visibility?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export default class CourseRepo {
  private getExecutor(conn?: Pool | PoolConnection) {
    return conn || pool;
  }

  private mapRow(row: any) {
    if (!row) return row;
    return {
      ...row,
      is_active:
        row.is_active === null || row.is_active === undefined ? true : Boolean(row.is_active),
      menu_visibility:
        row.menu_visibility === null || row.menu_visibility === undefined
          ? true
          : Boolean(row.menu_visibility),
    };
  }

  async findAll(page = 1, limit = 10, conn?: Pool | PoolConnection) {
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
        d.slug AS domain_slug,
        d.name AS domain_name
      FROM courses c
      INNER JOIN domains d ON c.domain_id = d.id
      WHERE c.is_active = 1 AND c.menu_visibility = 1
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
        (domain_id, name, slug, h1Tag, label, thumbnail, description, course_duration, upload_brochure, author_name, learning_mode, podcast_embed, priority, menu_visibility, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.domain_id,
        item.name,
        item.slug,
        item.h1Tag ?? null,
        item.label ?? null,
        item.thumbnail ?? null,
        item.description ?? null,
        item.course_duration ?? null,
        item.upload_brochure ?? null,
        item.author_name ?? null,
        item.learning_mode ?? null,
        item.podcast_embed ?? null,
        item.priority ?? 0,
        menuVisibility ? 1 : 0,
        isActive ? 1 : 0,
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
    if (saveWithDate) fields.push("updated_at = NOW()");

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