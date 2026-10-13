import pool from "../config/db";
import { HomeTitleDescription } from "../models/home_title_description.model";

export class HomeTitleDescriptionRepository {
  async findAll(pageNum = 1, limit = 10) {
    const offset = (pageNum - 1) * limit;
    const [rows] = await pool.query(
      "SELECT * FROM home_title_descriptions ORDER BY updated_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const [countRows]: any = await pool.query(
      "SELECT COUNT(*) as total FROM home_title_descriptions"
    );
    const total = countRows[0].total;
    return { data: rows, page: pageNum, pages: Math.ceil(total / limit), total };
  }

  async findById(id: number): Promise<HomeTitleDescription | null> {
    const [rows] = await pool.query(
      "SELECT * FROM home_title_descriptions WHERE id = ?",
      [id]
    );
    const data = rows as HomeTitleDescription[];
    return data.length ? data[0] : null;
  }

  async create(
    item: Omit<HomeTitleDescription, "id" | "created_at" | "updated_at">
  ): Promise<void> {
    await pool.query(
      `INSERT INTO home_title_descriptions (page, meta_title, meta_description, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [item.page, item.meta_title, item.meta_description]
    );
  }

  async update(
    id: number,
    item: Partial<
      Pick<HomeTitleDescription, "page" | "meta_title" | "meta_description">
    >,
    saveWithDate = true
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (item.page !== undefined && item.page !== null) {
      fields.push("page = ?");
      values.push(item.page);
    }

    if (item.meta_title !== undefined && item.meta_title !== null) {
      fields.push("meta_title = ?");
      values.push(item.meta_title);
    }

    if (item.meta_description !== undefined && item.meta_description !== null) {
      fields.push("meta_description = ?");
      values.push(item.meta_description);
    }

    if (saveWithDate) fields.push("updated_at = NOW()");

    if (!fields.length) return;

    values.push(id);
    await pool.query(
      `UPDATE home_title_descriptions SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM home_title_descriptions WHERE id = ?", [id]);
  }
}
