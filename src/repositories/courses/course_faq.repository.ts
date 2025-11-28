import pool from "../../config/db";
import { CourseFaqCategory, CourseFaq } from "../../models/courses/course_faq.model";

export class CourseFaqRepository {
  // -------- Course FAQ Categories --------
  async findAllCategories(page: number, limit: number): Promise<{ data: CourseFaqCategory[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // Fetch total count
    const [countRows] = await pool.query("SELECT COUNT(*) as total FROM course_faq_categories");
    const total = (countRows as any)[0].total;

    // Fetch paginated data
    const [rows] = await pool.query(
      "SELECT * FROM course_faq_categories ORDER BY created_at ASC, id ASC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    return {
      data: rows as CourseFaqCategory[],
      total,
      page,
      limit,
    };
  }

  async findCategoryById(id: number): Promise<CourseFaqCategory | null> {
    const [rows] = await pool.query("SELECT * FROM course_faq_categories WHERE id=?", [id]);
    const data = rows as CourseFaqCategory[];
    return data.length ? data[0] : null;
  }

  async createCategory(item: Omit<CourseFaqCategory, "id" | "created_at" | "updated_at">): Promise<CourseFaqCategory> {
    const [result]: any = await pool.query(
      `INSERT INTO course_faq_categories (heading, created_at, updated_at) VALUES (?, NOW(), NOW())`,
      [item.heading]
    );
    const [rows]: any = await pool.query("SELECT * FROM course_faq_categories WHERE id=?", [result.insertId]);
    return rows[0] as CourseFaqCategory;
  }

  async updateCategory(id: number, item: Partial<CourseFaqCategory> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = new Set(["heading"]);

    for (const [key, value] of Object.entries(item)) {
      if (key === "saveWithDate") continue;
      if (!allowedFields.has(key)) continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }

    // Only update updated_at if saveWithDate === true
    if (item.saveWithDate) {
      fields.push("updated_at = NOW()");
    }

    if (!fields.length) return false;

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE course_faq_categories SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteCategory(id: number): Promise<void> {
    await pool.query("DELETE FROM course_faq_categories WHERE id=?", [id]);
  }

  // -------- Course FAQ Questions --------

  async findAdminQuestions(page: number, limit: number, courseId?: number, categoryId?: number): Promise<{ data: CourseFaq[]; total: number; page: number; pages: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT f.*, c.heading, co.name AS course_name FROM course_faqs f LEFT JOIN course_faq_categories c ON f.category_id = c.id LEFT JOIN courses co ON f.course_id = co.id";
    let countQuery = "SELECT COUNT(*) as total FROM course_faqs f";
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

    query += " ORDER BY f.created_at ASC, f.id ASC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [countRows] = await pool.query(countQuery, countParams);
    const total = (countRows as any)[0].total;
    const pages = Math.ceil(total / limit);
    return { data: rows as CourseFaq[], total, page, pages };
  }

  async findAllQuestions(): Promise<{ data: CourseFaq[]; }> {
    const [rows] = await pool.query(
      `SELECT f.*, c.heading 
     FROM course_faqs f
     LEFT JOIN course_faq_categories c ON f.category_id = c.id
     ORDER BY f.created_at ASC, f.id ASC`,
    );
    return { data: rows as CourseFaq[] };
  }

  async findQuestionsByCategory(categoryId: number): Promise<CourseFaq[]> {
    const [rows] = await pool.query("SELECT * FROM course_faqs WHERE category_id=? ORDER BY created_at ASC, id ASC", [categoryId]);
    return rows as CourseFaq[];
  }

  async findQuestionsByCourseId(courseId: number): Promise<CourseFaq[]> {
    const [rows] = await pool.query(
      `SELECT f.*, c.heading 
     FROM course_faqs f
     LEFT JOIN course_faq_categories c ON f.category_id = c.id
     WHERE f.course_id = ?
     ORDER BY f.created_at ASC, f.id ASC`,
      [courseId]
    );
    return rows as CourseFaq[];
  }

  async findQuestionById(id: number): Promise<CourseFaq | null> {
    const [rows] = await pool.query("SELECT * FROM course_faqs WHERE id=?", [id]);
    const data = rows as CourseFaq[];
    return data.length ? data[0] : null;
  }

  async createQuestion(item: Omit<CourseFaq, "id" | "created_at" | "updated_at">): Promise<CourseFaq> {
    const [result]: any = await pool.query(
      `INSERT INTO course_faqs (course_id, category_id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [item.course_id, item.category_id, item.title, item.description]
    );
    const [rows]: any = await pool.query("SELECT * FROM course_faqs WHERE id=?", [result.insertId]);
    return rows[0] as CourseFaq;
  }

  // Update Course FAQ Question
  async updateQuestion(id: number, item: Partial<CourseFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    // Only allow valid course_faqs table columns to be updated
    const allowedFields = ['course_id', 'category_id', 'title', 'description'];

    for (const [key, value] of Object.entries(item)) {
      if (key !== "saveWithDate" && allowedFields.includes(key)) {
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
      `UPDATE course_faqs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteQuestion(id: number): Promise<void> {
    await pool.query("DELETE FROM course_faqs WHERE id=?", [id]);
  }
}

export default new CourseFaqRepository();

