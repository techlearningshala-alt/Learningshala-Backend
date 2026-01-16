import { log } from "console";
import pool from "../config/db";
import { FaqCategory, Faq } from "../models/faq_category.model";

export class FaqRepository {
  // -------- FAQ Categories --------
  async findAllCategories(page: number, limit: number): Promise<{ data: FaqCategory[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // Fetch total count
    const [countRows] = await pool.query("SELECT COUNT(*) as total FROM faq_categories");
    const total = (countRows as any)[0].total;

    // Fetch paginated data
    const [rows] = await pool.query(
      "SELECT * FROM faq_categories ORDER BY priority ASC, id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    return {
      data: rows as FaqCategory[],
      total,
      page,
      limit,
    };
  }


  async findCategoryById(id: number): Promise<FaqCategory | null> {
    const [rows] = await pool.query("SELECT * FROM faq_categories WHERE id=?", [id]);
    const data = rows as FaqCategory[];
    return data.length ? data[0] : null;
  }

  async createCategory(item: Omit<FaqCategory, "id" | "created_at" | "updated_at">): Promise<FaqCategory> {
    const [result]: any = await pool.query(
      `INSERT INTO faq_categories (heading, priority, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
      [item.heading, item.priority ?? 999]
    );
    const [rows]: any = await pool.query("SELECT * FROM faq_categories WHERE id=?", [result.insertId]);
    return rows[0] as FaqCategory;
  }

  async updateCategory(id: number, item: Partial<FaqCategory> & { saveWithDate?: boolean }): Promise<boolean> {
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
    } else {
      // If saveWithDate is false, explicitly set updated_at = updated_at to prevent ON UPDATE CURRENT_TIMESTAMP
      fields.push("updated_at = updated_at");
    }

    if (!fields.length) return false;

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE faq_categories SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }


  async deleteCategory(id: number): Promise<void> {
    await pool.query("DELETE FROM faq_categories WHERE id=?", [id]);
  }

  // -------- FAQ Questions --------


  async findAdminQuestions(page: number, limit: number): Promise<{ data: Faq[]; total: number; page: number; pages: number }> 
  { const offset = (page - 1) * limit;
   const [rows] = await pool.query( "SELECT f.*, c.heading FROM faqs f LEFT JOIN faq_categories c ON f.category_id = c.id ORDER BY f.created_at DESC LIMIT ? OFFSET ?", [limit, offset] ); 
   const [countRows] = await pool.query("SELECT COUNT(*) as total FROM faqs"); 
   const total = (countRows as any)[0].total; 
   const pages = Math.ceil(total / limit); 
   return { data: rows as Faq[], total, page, pages }; }

  async findAllQuestions(): Promise<{ data: Faq[];}> {

    const [rows] = await pool.query(
      `SELECT f.*, c.heading, c.priority as category_priority
     FROM faqs f
     LEFT JOIN faq_categories c ON f.category_id = c.id
     ORDER BY c.priority ASC, c.id ASC, f.created_at DESC`,
    );
    return { data: rows as Faq[] };
  }



  async findQuestionsByCategory(categoryId: number): Promise<Faq[]> {
    const [rows] = await pool.query("SELECT * FROM faqs WHERE category_id=? ORDER BY created_at DESC", [categoryId]);
    return rows as Faq[];
  }

  async findQuestionById(id: number): Promise<Faq | null> {
    const [rows] = await pool.query("SELECT * FROM faqs WHERE id=?", [id]);
    const data = rows as Faq[];
    return data.length ? data[0] : null;
  }

  async createQuestion(item: Omit<Faq, "id" | "created_at" | "updated_at">): Promise<Faq> {
    const [result]: any = await pool.query(
      `INSERT INTO faqs (category_id, title, description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`,
      [item.category_id, item.title, item.description]
    );
    const [rows]: any = await pool.query("SELECT * FROM faqs WHERE id=?", [result.insertId]);
    return rows[0] as Faq;
  }

  // Update FAQ Question
  async updateQuestion(id: number, item: Partial<FaqCategory> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(item)) {
      if (key !== "saveWithDate") { // skip frontend flag
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    console.log(item.saveWithDate, "item.saveWithDate")
    // Only update updated_at if saveWithDate === true
    if (item.saveWithDate) {
      fields.push("updated_at = NOW()");
    }

    if (!fields.length) return false;

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE faqs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteQuestion(id: number): Promise<void> {
    await pool.query("DELETE FROM faqs WHERE id=?", [id]);
  }
}
