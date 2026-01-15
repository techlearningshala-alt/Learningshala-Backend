import pool from "../../config/db";
import { BlogCategory } from "../../models/blogs/blog_category.model";

export class BlogCategoryRepository {
  async findAll(page: number, limit: number): Promise<{ data: BlogCategory[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // Fetch total count
    const [countRows]: any = await pool.query("SELECT COUNT(*) as total FROM blog_categories");
    const total = countRows[0].total;

    // Fetch paginated data
    const [rows]: any = await pool.query(
      "SELECT * FROM blog_categories ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    return {
      data: rows as BlogCategory[],
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<BlogCategory | null> {
    const [rows]: any = await pool.query("SELECT * FROM blog_categories WHERE id=?", [id]);
    const data = rows as BlogCategory[];
    return data.length ? data[0] : null;
  }

  async findBySlug(slug: string): Promise<BlogCategory | null> {
    const [rows]: any = await pool.query("SELECT * FROM blog_categories WHERE category_slug=?", [slug]);
    const data = rows as BlogCategory[];
    return data.length ? data[0] : null;
  }

  async create(item: Omit<BlogCategory, "id" | "created_at" | "updated_at">): Promise<BlogCategory> {
    const [result]: any = await pool.query(
      `INSERT INTO blog_categories (title, category_slug, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
      [item.title, item.category_slug]
    );
    const [rows]: any = await pool.query("SELECT * FROM blog_categories WHERE id=?", [result.insertId]);
    return rows[0] as BlogCategory;
  }

  async update(id: number, item: Partial<BlogCategory> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = new Set(["title", "category_slug"]);

    for (const [key, value] of Object.entries(item)) {
      if (key === "saveWithDate") continue;
      if (!allowedFields.has(key)) continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }

    // Only update updated_at if saveWithDate === true
    if (item.saveWithDate) {
      fields.push("updated_at = NOW()");
    } else {
      // Prevent updated_at from being auto-updated
      fields.push("updated_at = updated_at");
    }

    if (!fields.length) return false;

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE blog_categories SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM blog_categories WHERE id=?", [id]);
  }
}
