import pool from "../../config/db";
import { NewsFaq } from "../../models/news/news_faq.model";

export class NewsFaqRepository {
  async findAdminQuestions(page: number, limit: number, newsId?: number): Promise<{ data: NewsFaq[]; total: number; page: number; pages: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT f.*, n.title AS news_title FROM news_faqs f LEFT JOIN news n ON f.news_id = n.id";
    let countQuery = "SELECT COUNT(*) as total FROM news_faqs f";
    const params: any[] = [];
    const countParams: any[] = [];
    const conditions: string[] = [];

    if (newsId) {
      conditions.push("f.news_id = ?");
      params.push(newsId);
      countParams.push(newsId);
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
    return { data: rows as NewsFaq[], total, page, pages };
  }

  async findAllQuestions(): Promise<{ data: NewsFaq[]; }> {
    const [rows] = await pool.query(
      `SELECT f.*
     FROM news_faqs f
     ORDER BY f.created_at ASC, f.id ASC`,
    );
    return { data: rows as NewsFaq[] };
  }

  async findQuestionsByNewsId(newsId: number): Promise<NewsFaq[]> {
    const [rows] = await pool.query(
      `SELECT f.*
     FROM news_faqs f
     WHERE f.news_id = ?
     ORDER BY f.created_at ASC, f.id ASC`,
      [newsId]
    );
    return rows as NewsFaq[];
  }

  async findQuestionById(id: number): Promise<NewsFaq | null> {
    const [rows] = await pool.query("SELECT * FROM news_faqs WHERE id=?", [id]);
    const data = rows as NewsFaq[];
    return data.length ? data[0] : null;
  }

  async createQuestion(item: Omit<NewsFaq, "id" | "created_at" | "updated_at">): Promise<NewsFaq> {
    const [result]: any = await pool.query(
      `INSERT INTO news_faqs (news_id, title, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`,
      [item.news_id, item.title, item.description]
    );
    const [createdRows]: any = await pool.query("SELECT * FROM news_faqs WHERE id=?", [result.insertId]);
    return createdRows[0] as NewsFaq;
  }

  async updateQuestion(id: number, item: Partial<NewsFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = ["news_id", "title", "description"];

    for (const [key, value] of Object.entries(item)) {
      if (key !== "saveWithDate" && allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (item.saveWithDate) {
      fields.push("updated_at = NOW()");
    }

    if (!fields.length) return false;

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE news_faqs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteQuestion(id: number): Promise<void> {
    await pool.query("DELETE FROM news_faqs WHERE id=?", [id]);
  }
}

export default new NewsFaqRepository();
