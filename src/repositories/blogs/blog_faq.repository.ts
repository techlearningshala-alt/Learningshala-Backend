import pool from "../../config/db";
import { BlogFaqCategory, BlogFaq } from "../../models/blogs/blog_faq.model";

export class BlogFaqRepository {
  // -------- Blog FAQ Categories --------
  async findAllCategories(page: number, limit: number): Promise<{ data: BlogFaqCategory[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // Fetch total count
    const [countRows] = await pool.query("SELECT COUNT(*) as total FROM blog_faq_categories");
    const total = (countRows as any)[0].total;

    // Fetch paginated data
    const [rows] = await pool.query(
      "SELECT * FROM blog_faq_categories ORDER BY priority ASC, id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    return {
      data: rows as BlogFaqCategory[],
      total,
      page,
      limit,
    };
  }

  async findCategoryById(id: number): Promise<BlogFaqCategory | null> {
    const [rows] = await pool.query("SELECT * FROM blog_faq_categories WHERE id=?", [id]);
    const data = rows as BlogFaqCategory[];
    return data.length ? data[0] : null;
  }

  async createCategory(item: Omit<BlogFaqCategory, "id" | "created_at" | "updated_at">): Promise<BlogFaqCategory> {
    const [result]: any = await pool.query(
      `INSERT INTO blog_faq_categories (heading, priority, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
      [item.heading, item.priority ?? 999]
    );
    const [rows]: any = await pool.query("SELECT * FROM blog_faq_categories WHERE id=?", [result.insertId]);
    return rows[0] as BlogFaqCategory;
  }

  async updateCategory(id: number, item: Partial<BlogFaqCategory> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = new Set(["heading", "priority"]);

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
      `UPDATE blog_faq_categories SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteCategory(id: number): Promise<void> {
    await pool.query("DELETE FROM blog_faq_categories WHERE id=?", [id]);
  }

  // -------- Blog FAQ Questions --------

  async findAdminQuestions(page: number, limit: number, blogId?: number, categoryId?: number): Promise<{ data: BlogFaq[]; total: number; page: number; pages: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT f.*, c.heading, b.title AS blog_title FROM blog_faqs f LEFT JOIN blog_faq_categories c ON f.category_id = c.id LEFT JOIN blogs b ON f.blog_id = b.id";
    let countQuery = "SELECT COUNT(*) as total FROM blog_faqs f";
    const params: any[] = [];
    const countParams: any[] = [];
    const conditions: string[] = [];

    if (blogId) {
      conditions.push("f.blog_id = ?");
      params.push(blogId);
      countParams.push(blogId);
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
    return { data: rows as BlogFaq[], total, page, pages };
  }

  async findAllQuestions(): Promise<{ data: BlogFaq[]; }> {
    const [rows] = await pool.query(
      `SELECT f.*, c.heading 
     FROM blog_faqs f
     LEFT JOIN blog_faq_categories c ON f.category_id = c.id
     ORDER BY f.created_at ASC, f.id ASC`,
    );
    return { data: rows as BlogFaq[] };
  }

  async findQuestionsByCategory(categoryId: number): Promise<BlogFaq[]> {
    const [rows] = await pool.query("SELECT * FROM blog_faqs WHERE category_id=? ORDER BY created_at ASC, id ASC", [categoryId]);
    return rows as BlogFaq[];
  }

  async findQuestionsByBlogId(blogId: number): Promise<BlogFaq[]> {
    const [rows] = await pool.query(
      `SELECT f.*, c.heading 
     FROM blog_faqs f
     LEFT JOIN blog_faq_categories c ON f.category_id = c.id
     WHERE f.blog_id = ?
     ORDER BY f.created_at ASC, f.id ASC`,
      [blogId]
    );
    return rows as BlogFaq[];
  }

  async findQuestionById(id: number): Promise<BlogFaq | null> {
    const [rows] = await pool.query("SELECT * FROM blog_faqs WHERE id=?", [id]);
    const data = rows as BlogFaq[];
    return data.length ? data[0] : null;
  }

  async createQuestion(item: Omit<BlogFaq, "id" | "created_at" | "updated_at">): Promise<BlogFaq> {
    const [result]: any = await pool.query(
      `INSERT INTO blog_faqs (blog_id, category_id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [item.blog_id, item.category_id, item.title, item.description]
    );
    const [rows]: any = await pool.query("SELECT * FROM blog_faqs WHERE id=?", [result.insertId]);
    return rows[0] as BlogFaq;
  }

  // Update Blog FAQ Question
  async updateQuestion(id: number, item: Partial<BlogFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    // Only allow valid blog_faqs table columns to be updated
    const allowedFields = ['blog_id', 'category_id', 'title', 'description'];

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
      `UPDATE blog_faqs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteQuestion(id: number): Promise<void> {
    await pool.query("DELETE FROM blog_faqs WHERE id=?", [id]);
  }
}

export default new BlogFaqRepository();
