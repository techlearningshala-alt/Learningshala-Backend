import pool from "../../config/db";
import { Specialization } from "../../models/courses/specializations.model";

export default class SpecializationRepo {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows]: any = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS s.*, c.name AS course_name
     FROM specializations s
     LEFT JOIN courses c ON s.course_id = c.id
     ORDER BY s.priority ASC, s.updated_at DESC 
     LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");

    return { data: rows, page, pages: Math.ceil(total / limit), total };
  }

  async findById(id: number) {
    const [rows]: any = await pool.query("SELECT * FROM specializations WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  async create(item: Partial<Specialization>) {
    const [result]: any = await pool.query(
      "INSERT INTO specializations (course_id, name, slug, thumbnail, description, priority, is_active, menu_visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [item.course_id, item.name, item.slug, item.thumbnail, item.description, item.priority, item.is_active, item.menu_visibility]
    );
    const [rows]: any = await pool.query("SELECT * FROM specializations WHERE id = ?", [result.insertId]);
    return rows[0];
  }

  async update(id: number, item: Partial<Specialization>, saveWithDate = true) {
    const fields: string[] = [];
    const values: any[] = [];

    if (item.course_id !== undefined) { fields.push("course_id = ?"); values.push(item.course_id); }
    if (item.name !== undefined) { fields.push("name = ?"); values.push(item.name); }
    if (item.slug !== undefined) { fields.push("slug = ?"); values.push(item.slug); }
    if (item.thumbnail !== undefined) { fields.push("thumbnail = ?"); values.push(item.thumbnail); }
    if (item.description !== undefined) { fields.push("description = ?"); values.push(item.description); }
    if (item.menu_visibility !== undefined) { fields.push("menu_visibility = ?"); values.push(item.menu_visibility); }
    if (item.is_active !== undefined) { fields.push("is_active = ?"); values.push(item.is_active); }
    if (item.priority !== undefined) { fields.push("priority = ?"); values.push(item.priority); }

    if (!fields.length) return null;
    if (saveWithDate) fields.push("updated_at = NOW()");

    values.push(id);
    const [result]: any = await pool.query(`UPDATE specializations SET ${fields.join(", ")} WHERE id = ?`, values);

    if (result.affectedRows === 0) return null;

    const [rows]: any = await pool.query("SELECT * FROM specializations WHERE id = ?", [id]);
    return rows[0];
  }

  async delete(id: number) {
    const [result]: any = await pool.query("DELETE FROM specializations WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
