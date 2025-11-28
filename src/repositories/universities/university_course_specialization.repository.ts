import pool from "../../config/db";
import {
  CreateUniversityCourseSpecializationDto,
  UniversityCourseSpecialization,
  UpdateUniversityCourseSpecializationDto,
} from "../../models/universities/university_course_specialization.model";

interface ListSpecializationFilters {
  universityId?: number;
  universityCourseId?: number;
  search?: string;
}

export class UniversityCourseSpecializationRepository {
  async findAll(
    page = 1,
    limit = 10,
    filters: ListSpecializationFilters = {}
  ) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = ["1=1"];

    if (filters.universityId) {
      where.push("ucs.university_id = ?");
      params.push(filters.universityId);
    }

    if (filters.universityCourseId) {
      where.push("ucs.university_course_id = ?");
      params.push(filters.universityCourseId);
    }

    if (filters.search) {
      where.push("(ucs.name LIKE ? OR ucs.slug LIKE ?)");
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows]: any = await pool.query(
      `SELECT ucs.*,
              uc.name AS course_name,
              u.university_name
         FROM university_course_specialization ucs
         INNER JOIN university_courses uc ON ucs.university_course_id = uc.id
         INNER JOIN universities u ON ucs.university_id = u.id
        ${whereClause}
        ORDER BY ucs.created_at ASC, ucs.id ASC
        LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total
         FROM university_course_specialization ucs
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

  async findOptionsByCourse(universityCourseId: number) {
    const [rows]: any = await pool.query(
      `SELECT id, name, slug, duration, course_thumbnail, fee_type_values
         FROM university_course_specialization
        WHERE university_course_id = ? AND is_active = 1
        ORDER BY name ASC`,
      [universityCourseId]
    );
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      duration: row.duration,
      course_thumbnail: row.course_thumbnail,
      fee_type_values: row.fee_type_values 
        ? (typeof row.fee_type_values === 'string' ? JSON.parse(row.fee_type_values) : row.fee_type_values)
        : null,
    }));
  }

  async findBySlug(slug: string) {
    const [rows]: any = await pool.query(
      `SELECT * FROM university_course_specialization WHERE slug = ? LIMIT 1`,
      [slug]
    );
    return rows.length ? this.mapRowToModel(rows[0]) : null;
  }

  async findById(id: number) {
    const [rows]: any = await pool.query(
      `SELECT * FROM university_course_specialization WHERE id = ?`,
      [id]
    );
    return rows.length ? this.mapRowToModel(rows[0]) : null;
  }

  async findByCourseIdAndSlug(courseId: number, slug: string) {
    const [rows]: any = await pool.query(
      `SELECT ucs.*,
              uc.slug AS course_slug,
              u.university_slug AS university_slug
         FROM university_course_specialization ucs
         INNER JOIN university_courses uc ON ucs.university_course_id = uc.id
         INNER JOIN universities u ON ucs.university_id = u.id
        WHERE ucs.university_course_id = ? AND ucs.slug = ?
        LIMIT 1`,
      [courseId, slug]
    );
    return rows.length ? this.mapRowToModel(rows[0]) : null;
  }

  private mapRowToModel(row: any): UniversityCourseSpecialization {
    return {
      ...row,
      fee_type_values: row.fee_type_values
        ? JSON.parse(row.fee_type_values)
        : null,
      is_active:
        row.is_active === null || row.is_active === undefined
          ? true
          : Boolean(row.is_active),
      is_page_created:
        row.is_page_created === null || row.is_page_created === undefined
          ? true
          : Boolean(row.is_page_created),
    };
  }

  async create(payload: CreateUniversityCourseSpecializationDto) {
    const [result]: any = await pool.query(
      `INSERT INTO university_course_specialization
        (university_id, university_course_id, name, slug, h1Tag, duration, label, course_thumbnail, author_name, is_active, is_page_created, syllabus_file, brochure_file, fee_type_values)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.university_id,
        payload.university_course_id,
        payload.name,
        payload.slug,
        payload.h1Tag ?? null,
        payload.duration ?? null,
        payload.label ?? null,
        payload.course_thumbnail ?? null,
        payload.author_name ?? null,
        payload.is_active !== undefined ? (payload.is_active ? 1 : 0) : 1,
        payload.is_page_created !== undefined ? (payload.is_page_created ? 1 : 0) : 1,
        payload.syllabus_file ?? null,
        payload.brochure_file ?? null,
        payload.fee_type_values ? JSON.stringify(payload.fee_type_values) : null,
      ]
    );

    return this.findById(result.insertId);
  }

  async update(id: number, payload: UpdateUniversityCourseSpecializationDto) {
    const fields: string[] = [];
    const values: any[] = [];

    if (payload.university_id !== undefined) {
      fields.push("university_id = ?");
      values.push(payload.university_id);
    }
    if (payload.university_course_id !== undefined) {
      fields.push("university_course_id = ?");
      values.push(payload.university_course_id);
    }
    if (payload.name !== undefined) {
      fields.push("name = ?");
      values.push(payload.name);
    }
    if (payload.slug !== undefined) {
      fields.push("slug = ?");
      values.push(payload.slug);
    }
    if (payload.h1Tag !== undefined) {
      fields.push("h1Tag = ?");
      values.push(payload.h1Tag ?? null);
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
    if (payload.is_page_created !== undefined) {
      fields.push("is_page_created = ?");
      values.push(payload.is_page_created ? 1 : 0);
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
      `UPDATE university_course_specialization SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number) {
    const [result]: any = await pool.query(
      `DELETE FROM university_course_specialization WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new UniversityCourseSpecializationRepository();

