import { BlogCategory } from "../../models/blogs/blog_category.model";
import pool from "../../config/db";

function mapRow(row: any): BlogCategory {
  return {
    ...row,
    category_visibility: row.category_visibility === 1 || row.category_visibility === true,
  } as BlogCategory;
}

export class BlogCategoryRepository {
  async findAll(page: number, limit: number): Promise<{ data: BlogCategory[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // Fetch total count
    const [countRows]: any = await pool.query("SELECT COUNT(*) as total FROM blog_categories");
    const total = countRows[0].total;

    // Fetch paginated data with blog count per category
    const [rows]: any = await pool.query(
      `SELECT 
         bc.*,
         COUNT(b.id) AS blog_count
       FROM blog_categories bc
       LEFT JOIN blogs b ON b.category_id = bc.id
       GROUP BY bc.id
       ORDER BY bc.id DESC
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

  async findById(id: number): Promise<BlogCategory | null> {
    const [rows]: any = await pool.query("SELECT * FROM blog_categories WHERE id=?", [id]);
    if (!rows.length) return null;
    return mapRow(rows[0]);
  }

  async findBySlug(slug: string): Promise<BlogCategory | null> {
    const [rows]: any = await pool.query("SELECT * FROM blog_categories WHERE category_slug=?", [slug]);
    if (!rows.length) return null;
    return mapRow(rows[0]);
  }

  async create(item: Omit<BlogCategory, "id" | "created_at" | "updated_at">): Promise<BlogCategory> {
    const [result]: any = await pool.query(
      `INSERT INTO blog_categories (title, category_slug, category_visibility, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`,
      [
        item.title,
        item.category_slug,
        item.category_visibility ? 1 : 0,
      ]
    );
    const [rows]: any = await pool.query("SELECT * FROM blog_categories WHERE id=?", [result.insertId]);
    return mapRow(rows[0]);
  }

  async update(id: number, item: Partial<BlogCategory> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = new Set(["title", "category_slug", "category_visibility"]);

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
