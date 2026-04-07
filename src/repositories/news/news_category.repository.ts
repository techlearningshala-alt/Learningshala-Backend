import { NewsCategory } from "../../models/news/news_category.model";
import pool from "../../config/db";

function mapRow(row: any): NewsCategory {
  return {
    ...row,
    category_visibility: row.category_visibility === 1 || row.category_visibility === true,
  } as NewsCategory;
}

export class NewsCategoryRepository {
  async findAll(page: number, limit: number): Promise<{ data: NewsCategory[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    const [countRows]: any = await pool.query("SELECT COUNT(*) as total FROM news_categories");
    const total = countRows[0].total;

    const [rows]: any = await pool.query(
      `SELECT nc.*
       FROM news_categories nc
       ORDER BY nc.id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const data = (rows as any[]).map(mapRow);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<NewsCategory | null> {
    const [rows]: any = await pool.query("SELECT * FROM news_categories WHERE id=?", [id]);
    if (!rows.length) return null;
    return mapRow(rows[0]);
  }

  async findBySlug(slug: string): Promise<NewsCategory | null> {
    const [rows]: any = await pool.query("SELECT * FROM news_categories WHERE category_slug=?", [slug]);
    if (!rows.length) return null;
    return mapRow(rows[0]);
  }

  async create(item: Omit<NewsCategory, "id" | "created_at" | "updated_at">): Promise<NewsCategory> {
    const [result]: any = await pool.query(
      `INSERT INTO news_categories (title, category_slug, category_visibility, category_summary, meta_title, meta_description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        item.title,
        item.category_slug,
        item.category_visibility ? 1 : 0,
        item.category_summary ?? null,
        item.meta_title ?? null,
        item.meta_description ?? null,
      ]
    );
    const [rows]: any = await pool.query("SELECT * FROM news_categories WHERE id=?", [result.insertId]);
    return mapRow(rows[0]);
  }

  async update(id: number, item: Partial<NewsCategory> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = new Set([
      "title",
      "category_slug",
      "category_visibility",
      "category_summary",
      "meta_title",
      "meta_description",
    ]);

    for (const [key, value] of Object.entries(item)) {
      if (key === "saveWithDate") continue;
      if (!allowedFields.has(key)) continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (item.saveWithDate) {
      fields.push("updated_at = NOW()");
    } else {
      fields.push("updated_at = updated_at");
    }

    if (!fields.length) return false;

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE news_categories SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM news_categories WHERE id=?", [id]);
  }
}
