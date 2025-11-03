import pool from "../config/db";

export interface StudentTestimonial {
  id?: number;
  name: string;
  thumbnail: string;
  video_id: string;
  video_title: string;
  created_at?: Date;
  updated_at?: Date;
}

export default class StudentTestimonialRepo {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows]: any = await pool.query(
      "SELECT SQL_CALC_FOUND_ROWS * FROM student_testimonials ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");
    return { data: rows, page, pages: Math.ceil(total / limit), total };
  }

  async findById(id: number) {
    const [rows]: any = await pool.query("SELECT * FROM student_testimonials WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  async create(item: StudentTestimonial) {
    const [result]: any = await pool.query(
      "INSERT INTO student_testimonials (name, thumbnail, video_id, video_title) VALUES (?, ?, ?, ?)",
      [item.name, item.thumbnail, item.video_id, item.video_title]
    );
    return result.insertId;
  }

  async update(id: number, item: Partial<StudentTestimonial>, saveWithDate = true) {
    const fields: string[] = [];
    const values: any[] = [];

    if (item.name !== undefined) { fields.push("name = ?"); values.push(item.name); }
    if (item.thumbnail !== undefined) { fields.push("thumbnail = ?"); values.push(item.thumbnail); }
    if (item.video_id !== undefined) { fields.push("video_id = ?"); values.push(item.video_id); }
    if (item.video_title !== undefined) { fields.push("video_title = ?"); values.push(item.video_title); }

    if (saveWithDate) fields.push("updated_at = NOW()");

    if (!fields.length) return false;

    values.push(id);
    const [result]: any = await pool.query(
      `UPDATE student_testimonials SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id: number) {
    const [result]: any = await pool.query("DELETE FROM student_testimonials WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

