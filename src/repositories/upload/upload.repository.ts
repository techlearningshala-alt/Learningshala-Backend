import pool from "../../config/db";
import { Upload, CreateUploadDto, UpdateUploadDto } from "../../models/upload/upload.model";

export class UploadRepository {
  private mapRow(row: any): Upload {
    return {
      ...row,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const [rows]: any = await pool.query(
      `SELECT SQL_CALC_FOUND_ROWS * FROM uploads ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");

    return {
      data: rows.map((r: any) => this.mapRow(r)),
      page,
      pages: Math.ceil(total / limit),
      total,
    };
  }

  async findById(id: number): Promise<Upload | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM uploads WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async findByFilePath(filePath: string): Promise<Upload | null> {
    const [rows]: any = await pool.query(
      `SELECT * FROM uploads WHERE file_path = ? LIMIT 1`,
      [filePath]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async create(item: CreateUploadDto): Promise<Upload> {
    const [result]: any = await pool.query(
      `INSERT INTO uploads (name, file_path, file_type) VALUES (?, ?, ?)`,
      [item.name ?? null, item.file_path, item.file_type]
    );
    return this.findById(result.insertId) as Promise<Upload>;
  }

  async update(id: number, item: UpdateUploadDto): Promise<Upload | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (item.name !== undefined) {
      fields.push("name = ?");
      values.push(item.name ?? null);
    }
    if (item.file_path !== undefined) {
      fields.push("file_path = ?");
      values.push(item.file_path);
    }
    if (item.file_type !== undefined) {
      fields.push("file_type = ?");
      values.push(item.file_type);
    }

    if (!fields.length) return this.findById(id);

    fields.push("updated_at = NOW()");
    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE uploads SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result]: any = await pool.query(`DELETE FROM uploads WHERE id = ?`, [id]);
    return result.affectedRows > 0;
  }
}

export default new UploadRepository();
