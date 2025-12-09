import pool from "../../config/db";
import { CourseImage, CreateCourseImageDto, UpdateCourseImageDto } from "../../models/courses/course_image.model";

export class CourseImageRepository {
  private mapRow(row: any): CourseImage {
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows]: any = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS * FROM course_images ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");

    return {
      data: rows.map(this.mapRow),
      page,
      pages: Math.ceil(total / limit),
      total,
    };
  }

  async findAllForSelect() {
    const [rows]: any = await pool.query(
      `SELECT id, name, image FROM course_images ORDER BY name ASC`
    );
    return rows.map(this.mapRow);
  }

  async findById(id: number): Promise<CourseImage | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM course_images WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async create(item: CreateCourseImageDto): Promise<CourseImage> {
    const [result]: any = await pool.query(
      `INSERT INTO course_images (name, image) VALUES (?, ?)`,
      [item.name, item.image]
    );
    return this.findById(result.insertId) as Promise<CourseImage>;
  }

  async update(id: number, item: UpdateCourseImageDto): Promise<CourseImage | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (item.name !== undefined) {
      fields.push("name = ?");
      values.push(item.name);
    }
    if (item.image !== undefined) {
      fields.push("image = ?");
      values.push(item.image);
    }

    if (!fields.length) return null;

    fields.push("updated_at = NOW()");
    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE course_images SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM course_images WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new CourseImageRepository();

