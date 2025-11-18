import pool from "../../config/db";
import {
  CreateUniversityCourseDto,
  UniversityCourse,
  UpdateUniversityCourseDto,
} from "../../models/universities/university_course.model";

interface ListCourseFilters {
  universityId?: number;
  search?: string;
}

export class UniversityCourseRepository {
  async findAll(page = 1, limit = 10, filters: ListCourseFilters = {}) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = ["1=1"];

    if (filters.universityId) {
      where.push("uc.university_id = ?");
      params.push(filters.universityId);
    }

    if (filters.search) {
      where.push("(uc.name LIKE ? OR uc.slug LIKE ?)");
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows]: any = await pool.query(
      `SELECT 
          uc.*,
          u.university_name
        FROM university_courses uc
        INNER JOIN universities u ON uc.university_id = u.id
        ${whereClause}
        ORDER BY uc.updated_at DESC
        LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total
         FROM university_courses uc
        ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;

    return {
      data: rows.map(this.mapRowToModel),
      page,
      pages: limit ? Math.ceil(total / limit) : 1,
      total,
    };
  }

  async findById(id: number) {
    const [rows]: any = await pool.query(
      `SELECT 
          uc.*,
          u.university_name
        FROM university_courses uc
        INNER JOIN universities u ON uc.university_id = u.id
       WHERE uc.id = ?
       LIMIT 1`,
      [id]
    );
    return rows.length ? this.mapRowToModel(rows[0]) : null;
  }

  async findBySlug(slug: string) {
    const [rows]: any = await pool.query(
      `SELECT 
          uc.*,
          u.university_name
        FROM university_courses uc
        INNER JOIN universities u ON uc.university_id = u.id
       WHERE uc.slug = ?
       LIMIT 1`,
      [slug]
    );
    return rows.length ? this.mapRowToModel(rows[0]) : null;
  }

  async findByUniversityIdAndSlug(universityId: number, slug: string) {
    console.log(universityId, slug, "universityId and slug");
    const [rows]: any = await pool.query(
      `SELECT 
          uc.*,
          u.university_name
        FROM university_courses uc
        INNER JOIN universities u ON uc.university_id = u.id
       WHERE uc.university_id = ? AND uc.slug = ?
       LIMIT 1`,
      [universityId, slug]
    );
    return rows.length ? this.mapRowToModel(rows[0]) : null;
  }

  async create(payload: CreateUniversityCourseDto) {
    const [result]: any = await pool.query(
      `INSERT INTO university_courses
        (university_id, name, slug, duration, label, course_thumbnail, author_name, is_active, syllabus_file, brochure_file, fee_type_values)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.university_id,
        payload.name,
        payload.slug,
        payload.duration ?? null,
        payload.label ?? null,
        payload.course_thumbnail ?? null,
        payload.author_name ?? null,
        payload.is_active !== undefined ? (payload.is_active ? 1 : 0) : 1,
        payload.syllabus_file ?? null,
        payload.brochure_file ?? null,
        payload.fee_type_values ? JSON.stringify(payload.fee_type_values) : null,
      ]
    );

    return this.findById(result.insertId);
  }

  async update(id: number, payload: UpdateUniversityCourseDto) {
    const fields: string[] = [];
    const values: any[] = [];

    if (payload.university_id !== undefined) {
      fields.push("university_id = ?");
      values.push(payload.university_id);
    }
    if (payload.name !== undefined) {
      fields.push("name = ?");
      values.push(payload.name);
    }
    if (payload.slug !== undefined) {
      fields.push("slug = ?");
      values.push(payload.slug);
    }
    if (payload.duration !== undefined) {
      fields.push("duration = ?");
      values.push(payload.duration ?? null);
    }
    if (payload.label !== undefined) {
      fields.push("label = ?");
      values.push(payload.label ?? null);
    }
    if (payload.course_thumbnail !== undefined) {
      fields.push("course_thumbnail = ?");
      values.push(payload.course_thumbnail ?? null);
    }
    if (payload.author_name !== undefined) {
      fields.push("author_name = ?");
      values.push(payload.author_name ?? null);
    }
    if (payload.is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(payload.is_active ? 1 : 0);
    }
    if (payload.syllabus_file !== undefined) {
      fields.push("syllabus_file = ?");
      values.push(payload.syllabus_file ?? null);
    }
    if (payload.brochure_file !== undefined) {
      fields.push("brochure_file = ?");
      values.push(payload.brochure_file ?? null);
    }
    if (payload.fee_type_values !== undefined) {
      fields.push("fee_type_values = ?");
      values.push(
        payload.fee_type_values ? JSON.stringify(payload.fee_type_values) : null
      );
    }

    if (!fields.length) {
      return this.findById(id);
    }

    if (payload.saveWithDate === undefined || payload.saveWithDate) {
      fields.push("updated_at = NOW()");
    }

    values.push(id);

    await pool.query(
      `UPDATE university_courses SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number) {
    const [result]: any = await pool.query(
      `DELETE FROM university_courses WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  private mapRowToModel(row: any): UniversityCourse {
    return {
      ...row,
      fee_type_values: row.fee_type_values
        ? JSON.parse(row.fee_type_values)
        : null,
      is_active:
        row.is_active === null || row.is_active === undefined
          ? true
          : Boolean(row.is_active),
    };
  }
}

export default new UniversityCourseRepository();
