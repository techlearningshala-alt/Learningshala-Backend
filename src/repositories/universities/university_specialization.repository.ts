import pool from "../../config/db";
import {
  CreateUniversitySpecializationDto,
  UniversitySpecialization,
  UpdateUniversitySpecializationDto,
} from "../../models/universities/university_specialization.model";

interface ListSpecializationFilters {
  universityCourseId?: number;
  search?: string;
}

export class UniversitySpecializationRepository {
  async findAll(
    page = 1,
    limit = 10,
    filters: ListSpecializationFilters = {}
  ) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = ["1=1"];

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
         FROM university_course_specializations ucs
         INNER JOIN university_courses uc ON ucs.university_course_id = uc.id
         INNER JOIN universities u ON uc.university_id = u.id
        ${whereClause}
        ORDER BY ucs.updated_at DESC
        LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total
         FROM university_course_specializations ucs
        ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;

    return {
      data: rows as UniversitySpecialization[],
      page,
      pages: limit ? Math.ceil(total / limit) : 1,
      total,
    };
  }

  async findOptionsByCourse(universityCourseId: number) {
    const [rows]: any = await pool.query(
      `SELECT id, name, slug
         FROM university_course_specializations
        WHERE university_course_id = ?
        ORDER BY name ASC`,
      [universityCourseId]
    );
    return rows as Array<Pick<UniversitySpecialization, "id" | "name" | "slug">>;
  }

  async findById(id: number) {
    const [rows]: any = await pool.query(
      `SELECT * FROM university_course_specializations WHERE id = ?`,
      [id]
    );
    if (!rows.length) return null;
    const row = rows[0];
    return {
      ...row,
      is_page_created:
        row.is_page_created === null || row.is_page_created === undefined
          ? true
          : Boolean(row.is_page_created),
    } as UniversitySpecialization;
  }

  async create(payload: CreateUniversitySpecializationDto) {
    const [result]: any = await pool.query(
      `INSERT INTO university_course_specializations
        (university_course_id, name, slug, full_fees, sem_fees, duration, image, label, icon, is_page_created)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.university_course_id,
        payload.name,
        payload.slug,
        payload.full_fees ?? null,
        payload.sem_fees ?? null,
        payload.duration ?? null,
        payload.image ?? null,
        payload.label ?? null,
        payload.icon ?? null,
        payload.is_page_created !== undefined ? (payload.is_page_created ? 1 : 0) : 1,
      ]
    );

    return this.findById(result.insertId);
  }

  async update(id: number, payload: UpdateUniversitySpecializationDto) {
    const fields: string[] = [];
    const values: any[] = [];

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
    if (payload.full_fees !== undefined) {
      fields.push("full_fees = ?");
      values.push(payload.full_fees ?? null);
    }
    if (payload.sem_fees !== undefined) {
      fields.push("sem_fees = ?");
      values.push(payload.sem_fees ?? null);
    }
    if (payload.duration !== undefined) {
      fields.push("duration = ?");
      values.push(payload.duration ?? null);
    }
    if (payload.image !== undefined) {
      fields.push("image = ?");
      values.push(payload.image ?? null);
    }
    if (payload.label !== undefined) {
      fields.push("label = ?");
      values.push(payload.label ?? null);
    }
    if (payload.icon !== undefined) {
      fields.push("icon = ?");
      values.push(payload.icon ?? null);
    }
    if (payload.is_page_created !== undefined) {
      fields.push("is_page_created = ?");
      values.push(payload.is_page_created ? 1 : 0);
    }

    if (!fields.length) {
      return this.findById(id);
    }

    if (payload.saveWithDate === undefined || payload.saveWithDate) {
      fields.push("updated_at = NOW()");
    }

    values.push(id);

    await pool.query(
      `UPDATE university_course_specializations SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number) {
    const [result]: any = await pool.query(
      `DELETE FROM university_course_specializations WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new UniversitySpecializationRepository();
