import pool from "../config/db";
import { UniversityFaqCategory, UniversityFaq } from "../models/university_faq.model";

export class UniversityFaqRepository {
  // -------- University FAQ Categories --------
  async findAllCategories(page: number, limit: number): Promise<{ data: UniversityFaqCategory[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // Fetch total count
    const [countRows] = await pool.query("SELECT COUNT(*) as total FROM university_faq_categories");
    const total = (countRows as any)[0].total;

    // Fetch paginated data
    const [rows] = await pool.query(
      "SELECT * FROM university_faq_categories ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    return {
      data: rows as UniversityFaqCategory[],
      total,
      page,
      limit,
    };
  }

  async findCategoryById(id: number): Promise<UniversityFaqCategory | null> {
    const [rows] = await pool.query("SELECT * FROM university_faq_categories WHERE id=?", [id]);
    const data = rows as UniversityFaqCategory[];
    return data.length ? data[0] : null;
  }

  async createCategory(item: Omit<UniversityFaqCategory, "id" | "created_at" | "updated_at">): Promise<UniversityFaqCategory> {
    const [result]: any = await pool.query(
      `INSERT INTO university_faq_categories (heading, created_at, updated_at) VALUES (?, NOW(), NOW())`,
      [item.heading]
    );
    const [rows]: any = await pool.query("SELECT * FROM university_faq_categories WHERE id=?", [result.insertId]);
    return rows[0] as UniversityFaqCategory;
  }

  async updateCategory(id: number, item: Partial<UniversityFaqCategory> & { saveWithDate?: boolean }): Promise<boolean> {
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
      `UPDATE university_faq_categories SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteCategory(id: number): Promise<void> {
    await pool.query("DELETE FROM university_faq_categories WHERE id=?", [id]);
  }

  // -------- University FAQ Questions --------

  async findAdminQuestions(page: number, limit: number, universityId?: number, categoryId?: number): Promise<{ data: UniversityFaq[]; total: number; page: number; pages: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT f.*, c.heading, u.university_name FROM university_faqs f LEFT JOIN university_faq_categories c ON f.category_id = c.id LEFT JOIN universities u ON f.university_id = u.id";
    let countQuery = "SELECT COUNT(*) as total FROM university_faqs f";
    const params: any[] = [];
    const countParams: any[] = [];
    const conditions: string[] = [];

    if (universityId) {
      conditions.push("f.university_id = ?");
      params.push(universityId);
      countParams.push(universityId);
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
    return { data: rows as UniversityFaq[], total, page, pages };
  }

  async findAllQuestions(): Promise<{ data: UniversityFaq[]; }> {
    const [rows] = await pool.query(
      `SELECT f.*, c.heading 
     FROM university_faqs f
     LEFT JOIN university_faq_categories c ON f.category_id = c.id
     ORDER BY f.created_at DESC`,
    );
    return { data: rows as UniversityFaq[] };
  }

  async findQuestionsByCategory(categoryId: number): Promise<UniversityFaq[]> {
    const [rows] = await pool.query("SELECT * FROM university_faqs WHERE category_id=? ORDER BY created_at DESC", [categoryId]);
    return rows as UniversityFaq[];
  }

  async findQuestionById(id: number): Promise<UniversityFaq | null> {
    const [rows] = await pool.query("SELECT * FROM university_faqs WHERE id=?", [id]);
    const data = rows as UniversityFaq[];
    return data.length ? data[0] : null;
  }

  async createQuestion(item: Omit<UniversityFaq, "id" | "created_at" | "updated_at">): Promise<UniversityFaq> {
    const [result]: any = await pool.query(
      `INSERT INTO university_faqs (university_id, category_id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [item.university_id, item.category_id, item.title, item.description]
    );
    const [rows]: any = await pool.query("SELECT * FROM university_faqs WHERE id=?", [result.insertId]);
    return rows[0] as UniversityFaq;
  }

  // Update University FAQ Question
  async updateQuestion(id: number, item: Partial<UniversityFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    // Only allow valid university_faqs table columns to be updated
    const allowedFields = ['university_id', 'category_id', 'title', 'description'];

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
      `UPDATE university_faqs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteQuestion(id: number): Promise<void> {
    await pool.query("DELETE FROM university_faqs WHERE id=?", [id]);
  }
}

