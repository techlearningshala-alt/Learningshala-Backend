import pool from "../config/db";
import { UniversityCourseSpecializationFaq } from "../models/university_course_specialization_faq.model";

export class UniversityCourseSpecializationFaqRepository {
  // -------- University Course Specialization FAQ Questions --------

  async findAdminQuestions(page: number, limit: number, specializationId?: number, categoryId?: number): Promise<{ data: UniversityCourseSpecializationFaq[]; total: number; page: number; pages: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT f.*, c.heading, ucs.name as specialization_name FROM university_course_specialization_faqs f LEFT JOIN university_faq_categories c ON f.category_id = c.id LEFT JOIN university_course_specialization ucs ON f.specialization_id = ucs.id";
    let countQuery = "SELECT COUNT(*) as total FROM university_course_specialization_faqs f";
    const params: any[] = [];
    const countParams: any[] = [];
    const conditions: string[] = [];

    if (specializationId) {
      conditions.push("f.specialization_id = ?");
      params.push(specializationId);
      countParams.push(specializationId);
    }

    if (categoryId) {
      conditions.push("f.category_id = ?");
      params.push(categoryId);
      countParams.push(categoryId);
    }

    if (conditions.length > 0) {
      const whereClause = " WHERE " + conditions.join(" AND ");
      query += whereClause;
      countQuery += whereClause;
    }

    query += " ORDER BY f.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, countParams);
    const total = (countRows as any)[0].total;
    const pages = Math.ceil(total / limit);
    return { data: rows as UniversityCourseSpecializationFaq[], total, page, pages };
  }

  async findAllQuestions(): Promise<{ data: UniversityCourseSpecializationFaq[]; }> {
    const [rows] = await pool.query(
      `SELECT f.*, c.heading 
     FROM university_course_specialization_faqs f
     LEFT JOIN university_faq_categories c ON f.category_id = c.id
     ORDER BY f.created_at DESC`,
    );
    return { data: rows as UniversityCourseSpecializationFaq[] };
  }

  async findQuestionsByCategory(categoryId: number): Promise<UniversityCourseSpecializationFaq[]> {
    const [rows] = await pool.query("SELECT * FROM university_course_specialization_faqs WHERE category_id=? ORDER BY created_at DESC", [categoryId]);
    return rows as UniversityCourseSpecializationFaq[];
  }

  async findQuestionById(id: number): Promise<UniversityCourseSpecializationFaq | null> {
    const [rows] = await pool.query("SELECT * FROM university_course_specialization_faqs WHERE id=?", [id]);
    const data = rows as UniversityCourseSpecializationFaq[];
    return data.length ? data[0] : null;
  }

  async createQuestion(item: Omit<UniversityCourseSpecializationFaq, "id" | "created_at" | "updated_at">): Promise<UniversityCourseSpecializationFaq> {
    const [result]: any = await pool.query(
      `INSERT INTO university_course_specialization_faqs (specialization_id, category_id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [item.specialization_id, item.category_id, item.title, item.description]
    );
    const [rows]: any = await pool.query("SELECT * FROM university_course_specialization_faqs WHERE id=?", [result.insertId]);
    return rows[0] as UniversityCourseSpecializationFaq;
  }

  // Update University Course Specialization FAQ Question
  async updateQuestion(id: number, item: Partial<UniversityCourseSpecializationFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    // Only allow valid university_course_specialization_faqs table columns to be updated
    const allowedFields = ['specialization_id', 'category_id', 'title', 'description'];

    for (const [key, value] of Object.entries(item)) {
      if (key !== "saveWithDate" && allowedFields.includes(key)) { // skip frontend flag and only allow valid fields
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    // Only update updated_at if saveWithDate === true
    if (item.saveWithDate) {
      fields.push("updated_at = NOW()");
    }

    if (!fields.length) return false;

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE university_course_specialization_faqs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteQuestion(id: number): Promise<void> {
    await pool.query("DELETE FROM university_course_specialization_faqs WHERE id=?", [id]);
  }
}

