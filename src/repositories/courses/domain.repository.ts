import pool from "../../config/db";
import { Domain, DomainQuestion } from "../../models/courses/domains.model";

function serializeQuestions(questions: unknown): string | null {
  if (!Array.isArray(questions) || questions.length === 0) return null;
  return JSON.stringify(questions);
}

function parseQuestions(value: unknown): DomainQuestion[] {
  if (Array.isArray(value)) return value as DomainQuestion[];
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: any) {
  if (!row) return row;
  return { ...row, questions: parseQuestions(row.questions) };
}

export default class DomainRepo {
  async findAll(page = 1, limit = 10, onlyVisible = false) {
    const offset = (page - 1) * limit;
    let query = "SELECT SQL_CALC_FOUND_ROWS * FROM domains";
    if (onlyVisible) {
      query += " WHERE is_active = 1 AND menu_visibility = 1";
    }
    query += " ORDER BY priority ASC, id DESC LIMIT ? OFFSET ?";

    const [rows]: any = await pool.query(query, [limit, offset]);
    const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");
    return { data: (rows as any[]).map(mapRow), page, pages: Math.ceil(total / limit), total };
  }

  async findById(id: number) {
    const [rows]: any = await pool.query("SELECT * FROM domains WHERE id = ?", [id]);
    return rows.length ? mapRow(rows[0]) : null;
  }

  async create(item: Omit<Domain, "id" | "created_at" | "updated_at">) {
    const [result]: any = await pool.query(
      `INSERT INTO domains (name, priority, is_active, menu_visibility, slug, description, label, questions) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.name,
        item.priority,
        item.is_active,
        item.menu_visibility,
        item.slug,
        item.description,
        item.label || null,
        serializeQuestions(item.questions),
      ]
    );
    return { id: result.insertId, ...item };
  }

  async update(id: number, item: Partial<Domain>, saveWithDate: Boolean) {
    const fields: string[] = [];
    const values: any[] = [];
    if (item.name !== undefined) { fields.push("name = ?"); values.push(item.name); }
    if (item.description !== undefined) { fields.push("description = ?"); values.push(item.description); }
    if (item.label !== undefined) { fields.push("label = ?"); values.push(item.label || null); }
    if (item.priority !== undefined) { fields.push("priority = ?"); values.push(item.priority); }
    if (item.is_active !== undefined) { fields.push("is_active = ?"); values.push(item.is_active); }
    if (item.menu_visibility !== undefined) { fields.push("menu_visibility = ?"); values.push(item.menu_visibility); }
    if (item.slug !== undefined) { fields.push("slug = ?"); values.push(item.slug); }
    if (item.questions !== undefined) { fields.push("questions = ?"); values.push(serializeQuestions(item.questions)); }
    if (saveWithDate) fields.push("updated_at = NOW()");
    if (!fields.length) return null;

    values.push(id);
    const [result]: any = await pool.query(
      `UPDATE domains SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    
    if (result.affectedRows > 0) {
      // Return the updated domain
      return this.findById(id);
    }
    return null;
  }

  async delete(id: number) {
    const [result]: any = await pool.query("DELETE FROM domains WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
