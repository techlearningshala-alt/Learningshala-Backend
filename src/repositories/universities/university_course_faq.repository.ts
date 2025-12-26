import pool from "../../config/db";
import { UniversityCourseFaq } from "../../models/universities/university_course_faq.model";

export class UniversityCourseFaqRepository {
  // -------- University Course FAQ Questions --------

  async findAdminQuestions(page: number, limit: number, courseId?: number, categoryId?: number): Promise<{ data: UniversityCourseFaq[]; total: number; page: number; pages: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT f.*, c.heading, uc.name as course_name FROM university_course_faqs f LEFT JOIN university_faq_categories c ON f.category_id = c.id LEFT JOIN university_courses uc ON f.course_id = uc.id";
    let countQuery = "SELECT COUNT(*) as total FROM university_course_faqs f";
    const params: any[] = [];
    const countParams: any[] = [];
    const conditions: string[] = [];

    if (courseId) {
      conditions.push("f.course_id = ?");
      params.push(courseId);
      countParams.push(courseId);
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
    return { data: rows as UniversityCourseFaq[], total, page, pages };
  }

  async findAllQuestions(): Promise<{ data: UniversityCourseFaq[]; }> {
    const [rows] = await pool.query(
      `SELECT f.*, c.heading 
     FROM university_course_faqs f
     LEFT JOIN university_faq_categories c ON f.category_id = c.id
     ORDER BY f.created_at DESC`,
    );
    return { data: rows as UniversityCourseFaq[] };
  }

  async findQuestionsByCategory(categoryId: number): Promise<UniversityCourseFaq[]> {
    const [rows] = await pool.query("SELECT * FROM university_course_faqs WHERE category_id=? ORDER BY created_at DESC", [categoryId]);
    return rows as UniversityCourseFaq[];
  }

  async findQuestionById(id: number): Promise<UniversityCourseFaq | null> {
    const [rows] = await pool.query("SELECT * FROM university_course_faqs WHERE id=?", [id]);
    const data = rows as UniversityCourseFaq[];
    return data.length ? data[0] : null;
  }

  async createQuestion(item: Omit<UniversityCourseFaq, "id" | "created_at" | "updated_at">): Promise<UniversityCourseFaq> {
    const [result]: any = await pool.query(
      `INSERT INTO university_course_faqs (course_id, category_id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [item.course_id, item.category_id, item.title, item.description]
    );
    const [rows]: any = await pool.query("SELECT * FROM university_course_faqs WHERE id=?", [result.insertId]);
    return rows[0] as UniversityCourseFaq;
  }

  // Update University Course FAQ Question
  async updateQuestion(id: number, item: Partial<UniversityCourseFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    // Only allow valid university_course_faqs table columns to be updated
    const allowedFields = ['course_id', 'category_id', 'title', 'description'];

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
      `UPDATE university_course_faqs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteQuestion(id: number): Promise<void> {
    await pool.query("DELETE FROM university_course_faqs WHERE id=?", [id]);
  }
}

