import pool from "../../config/db";
import { Domain } from "../../models/courses/domains.model";

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
    return { data: rows, page, pages: Math.ceil(total / limit), total };
  }

  async findById(id: number) {
    const [rows]: any = await pool.query("SELECT * FROM domains WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  async create(item: Omit<Domain, "id" | "created_at" | "updated_at">) {
    const [result]: any = await pool.query(
      `INSERT INTO domains (name, priority, is_active, menu_visibility, slug, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [item.name, item.priority, item.is_active, item.menu_visibility, item.slug, item.description]
    );
    return { id: result.insertId, ...item };
  }

  async update(id: number, item: Partial<Domain>, saveWithDate: Boolean) {
    const fields: string[] = [];
    const values: any[] = [];
    if (item.name !== undefined) { fields.push("name = ?"); values.push(item.name); }
    if (item.description !== undefined) { fields.push("description = ?"); values.push(item.description); }
    if (item.priority !== undefined) { fields.push("priority = ?"); values.push(item.priority); }
    if (item.is_active !== undefined) { fields.push("is_active = ?"); values.push(item.is_active); }
    if (item.menu_visibility !== undefined) { fields.push("menu_visibility = ?"); values.push(item.menu_visibility); }
    if (item.slug !== undefined) { fields.push("slug = ?"); values.push(item.slug); }
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
