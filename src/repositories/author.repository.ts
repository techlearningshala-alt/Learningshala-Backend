import pool from "../config/db";
import { Author, CreateAuthorDto, UpdateAuthorDto } from "../models/author.model";

export class AuthorRepository {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows]: any = await pool.query(
      "SELECT SQL_CALC_FOUND_ROWS * FROM authors ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");
    return { data: rows as Author[], page, pages: Math.ceil(total / limit), total };
  }

  async findById(id: number): Promise<Author | null> {
    const [rows]: any = await pool.query("SELECT * FROM authors WHERE id = ?", [id]);
    return rows.length ? (rows[0] as Author) : null;
  }

  async create(item: CreateAuthorDto): Promise<Author> {
    const [result]: any = await pool.query(
      `INSERT INTO authors (author_name, image, author_details, label) VALUES (?, ?, ?, ?)`,
      [item.author_name, item.image, item.author_details, item.label]
    );
    const created = await this.findById(result.insertId);
    if (!created) {
      throw new Error("Failed to retrieve created author");
    }
    return created;
  }

  async update(id: number, item: UpdateAuthorDto, saveWithDate = true): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    if (item.author_name !== undefined) {
      fields.push("author_name = ?");
      values.push(item.author_name);
    }
    if (item.image !== undefined) {
      fields.push("image = ?");
      values.push(item.image);
    }
    if (item.author_details !== undefined) {
      fields.push("author_details = ?");
      values.push(item.author_details);
    }
    if (item.label !== undefined) {
      fields.push("label = ?");
      values.push(item.label);
    }

    if (fields.length === 0) return false;

    if (saveWithDate) {
      fields.push("updated_at = NOW()");
    }

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE authors SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<boolean> {
    const [result]: any = await pool.query("DELETE FROM authors WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

export default new AuthorRepository();
