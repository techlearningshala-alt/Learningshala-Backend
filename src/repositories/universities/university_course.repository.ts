import pool from "../../config/db";
import { UniversityCourse } from "../../models/universities/university_course.model";

export default class UniversityCourseRepository {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows]: any = await pool.query(
      `SELECT uc.*, u.name AS university_name, c.name AS course_name
       FROM university_courses uc
       JOIN universities u ON uc.university_id = u.id
       JOIN courses c ON uc.course_id = c.id
       ORDER BY uc.id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");
    return { data: rows, page, pages: Math.ceil(total / limit), total };
  }

  async findById(id: number) {
    const [rows]: any = await pool.query(
      `SELECT uc.*, u.name AS university_name, c.name AS course_name
       FROM university_courses uc
       JOIN universities u ON uc.university_id = u.id
       JOIN courses c ON uc.course_id = c.id
       WHERE uc.id = ?`,
      [id]
    );
    return rows.length ? rows[0] : null;
  }

  async create(item: Omit<UniversityCourse, "id" | "created_at" | "updated_at">) {
  const [result]: any = await pool.query(
    `INSERT INTO university_courses (university_id, course_id, duration, intake) VALUES (?, ?, ?, ?)`,
    [item.university_id, item.course_id, item.duration || null, item.intake || null]
  );
  return { id: result.insertId, ...item };
}

async update(id: number, item: Partial<UniversityCourse>, saveWithDate = true) {
  const fields: string[] = [];
  const values: any[] = [];

  if (item.university_id !== undefined) { fields.push("university_id = ?"); values.push(item.university_id); }
  if (item.course_id !== undefined) { fields.push("course_id = ?"); values.push(item.course_id); }
  if (item.duration !== undefined) { fields.push("duration = ?"); values.push(item.duration); }
  if (item.intake !== undefined) { fields.push("intake = ?"); values.push(item.intake); }

  if (saveWithDate) fields.push("updated_at = NOW()");
  if (!fields.length) return false;

  values.push(id);
  const [result]: any = await pool.query(
    `UPDATE university_courses SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

  async delete(id: number) {
    const [result]: any = await pool.query("DELETE FROM university_courses WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
