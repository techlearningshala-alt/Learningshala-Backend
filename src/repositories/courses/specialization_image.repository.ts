import pool from "../../config/db";
import { SpecializationImage, CreateSpecializationImageDto, UpdateSpecializationImageDto } from "../../models/courses/specialization_image.model";

export class SpecializationImageRepository {
  private mapRow(row: any): SpecializationImage {
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows]: any = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS * FROM specialization_images ORDER BY created_at DESC LIMIT ? OFFSET ?`,
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
      `SELECT id, name, image FROM specialization_images ORDER BY name ASC`
    );
    return rows.map(this.mapRow);
  }

  async findById(id: number): Promise<SpecializationImage | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM specialization_images WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async create(item: CreateSpecializationImageDto): Promise<SpecializationImage> {
    const [result]: any = await pool.query(
      `INSERT INTO specialization_images (name, image) VALUES (?, ?)`,
      [item.name, item.image]
    );
    return this.findById(result.insertId) as Promise<SpecializationImage>;
  }

  async update(id: number, item: UpdateSpecializationImageDto): Promise<SpecializationImage | null> {
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
      `UPDATE specialization_images SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM specialization_images WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new SpecializationImageRepository();

