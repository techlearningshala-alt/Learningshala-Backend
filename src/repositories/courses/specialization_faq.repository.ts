import pool from "../../config/db";
import { SpecializationFaq } from "../../models/courses/specialization_faq.model";

export class SpecializationFaqRepository {
  // Find FAQs by specialization ID
  async findQuestionsBySpecializationId(specializationId: number): Promise<SpecializationFaq[]> {
    const [rows] = await pool.query(
      `SELECT f.*, c.heading 
       FROM specialization_faqs f
       LEFT JOIN course_faq_categories c ON f.category_id = c.id
       WHERE f.specialization_id = ?
       ORDER BY f.created_at ASC, f.id ASC`,
      [specializationId]
    );
    return rows as SpecializationFaq[];
  }

  async findQuestionById(id: number): Promise<SpecializationFaq | null> {
    const [rows] = await pool.query("SELECT * FROM specialization_faqs WHERE id=?", [id]);
    const data = rows as SpecializationFaq[];
    return data.length ? data[0] : null;
  }

  async createQuestion(item: Omit<SpecializationFaq, "id" | "created_at" | "updated_at">): Promise<SpecializationFaq> {
    const [result]: any = await pool.query(
      `INSERT INTO specialization_faqs (specialization_id, category_id, title, description, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [item.specialization_id, item.category_id, item.title, item.description]
    );
    const [rows]: any = await pool.query("SELECT * FROM specialization_faqs WHERE id=?", [result.insertId]);
    return rows[0] as SpecializationFaq;
  }

  async updateQuestion(id: number, item: Partial<SpecializationFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = ['specialization_id', 'category_id', 'title', 'description'];

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
      `UPDATE specialization_faqs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async deleteQuestion(id: number): Promise<void> {
    await pool.query("DELETE FROM specialization_faqs WHERE id=?", [id]);
  }
}

export default new SpecializationFaqRepository();

