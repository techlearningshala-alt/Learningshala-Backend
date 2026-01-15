import pool from "../../config/db";
import { Blog } from "../../models/blogs/blog.model";

export interface ListBlogOptions {
  search?: string;
  category_id?: number;
}

export class BlogRepository {
  async findAll(
    page: number,
    limit: number,
    options: ListBlogOptions = {}
  ): Promise<{ data: Blog[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [];

    if (options.search) {
      where.push("(b.title LIKE ? OR b.short_description LIKE ? OR b.author_name LIKE ?)");
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (options.category_id) {
      where.push("b.category_id = ?");
      params.push(options.category_id);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    // Fetch total count
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM blogs b ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    // Fetch paginated data with category name
    const [rows]: any = await pool.query(
      `SELECT 
        b.id,
        b.category_id,
        b.title,
        b.short_description,
        b.author_name,
        b.author_details,
        b.author_image,
        b.thumbnail,
        b.verified,
        b.update_date,
        b.content,
        b.created_at,
        b.updated_at,
        bc.title as category_title,
        bc.category_slug as category_slug
      FROM blogs b
      LEFT JOIN blog_categories bc ON b.category_id = bc.id
      ${whereClause}
      ORDER BY b.id DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Map rows to Blog format
    const data = rows.map((row: any) => ({
      id: row.id,
      category_id: row.category_id,
      title: row.title,
      short_description: row.short_description,
      author_name: row.author_name,
      author_details: row.author_details,
      author_image: row.author_image,
      thumbnail: row.thumbnail,
      verified: Boolean(row.verified),
      update_date: row.update_date,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_title: row.category_title,
      category_slug: row.category_slug,
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<Blog | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        b.id,
        b.category_id,
        b.title,
        b.short_description,
        b.author_name,
        b.author_details,
        b.author_image,
        b.thumbnail,
        b.verified,
        b.update_date,
        b.content,
        b.created_at,
        b.updated_at,
        bc.title as category_title,
        bc.category_slug as category_slug
      FROM blogs b
      LEFT JOIN blog_categories bc ON b.category_id = bc.id
      WHERE b.id = ?`,
      [id]
    );
    if (!rows.length) return null;

    const row = rows[0];
    return {
      id: row.id,
      category_id: row.category_id,
      title: row.title,
      short_description: row.short_description,
      author_name: row.author_name,
      author_details: row.author_details,
      author_image: row.author_image,
      thumbnail: row.thumbnail,
      verified: Boolean(row.verified),
      update_date: row.update_date,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_title: row.category_title,
      category_slug: row.category_slug,
    } as Blog & { category_title?: string; category_slug?: string };
  }

  async create(item: Omit<Blog, "id" | "created_at" | "updated_at">): Promise<Blog> {
    const [result]: any = await pool.query(
      `INSERT INTO blogs (
        category_id, title, short_description, author_name, author_details, 
        author_image, thumbnail, verified, update_date, content, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        item.category_id,
        item.title,
        item.short_description ?? null,
        item.author_name ?? null,
        item.author_details ?? null,
        item.author_image ?? null,
        item.thumbnail ?? null,
        item.verified ? 1 : 0,
        item.update_date ?? null,
        item.content ?? null,
      ]
    );
    const [rows]: any = await pool.query("SELECT * FROM blogs WHERE id=?", [result.insertId]);
    return rows[0] as Blog;
  }

  async update(
    id: number,
    item: Partial<Blog> & { saveWithDate?: boolean }
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = new Set([
      "category_id",
      "title",
      "short_description",
      "author_name",
      "author_details",
      "author_image",
      "thumbnail",
      "verified",
      "update_date",
      "content",
    ]);

    for (const [key, value] of Object.entries(item)) {
      if (key === "saveWithDate") continue;
      if (!allowedFields.has(key)) continue;

      if (key === "verified") {
        fields.push(`${key} = ?`);
        values.push(value ? 1 : 0);
      } else if (key === "update_date" && value instanceof Date) {
        // Handle Date object for update_date
        fields.push(`${key} = ?`);
        values.push(value);
      } else {
        fields.push(`${key} = ?`);
        values.push(value ?? null);
      }
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
      `UPDATE blogs SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM blogs WHERE id=?", [id]);
  }
}
