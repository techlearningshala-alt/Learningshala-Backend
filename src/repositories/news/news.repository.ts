import pool from "../../config/db";
import { News } from "../../models/news/news.model";

export interface ListNewsOptions {
  search?: string;
  category_id?: number;
}

export class NewsRepository {
  async findAll(
    page: number,
    limit: number,
    options: ListNewsOptions = {}
  ): Promise<{ data: News[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [];

    if (options.search && options.search.trim()) {
      where.push("(n.title LIKE ? OR n.h1_tag LIKE ? OR a.author_name LIKE ? OR n.author_name LIKE ?)");
      const searchTerm = `%${options.search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (options.category_id) {
      where.push("n.category_id = ?");
      params.push(options.category_id);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total
       FROM news n
       LEFT JOIN authors a ON n.author_id = a.id
       ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows]: any = await pool.query(
      `SELECT 
        n.id,
        n.category_id,
        n.h1_tag,
        n.slug,
        n.meta_title,
        n.meta_description,
        n.author_id,
        n.title,
        n.short_description,
        a.author_name,
        a.author_details,
        a.image ,
        n.author_image,
        n.thumbnail,
        n.verified,
        n.update_date,
        n.content,
        n.created_at,
        n.updated_at,
        nc.title as category_title,
        nc.category_slug as category_slug
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      LEFT JOIN authors a ON n.author_id = a.id
      ${whereClause}
      ORDER BY n.id DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const data = rows.map((row: any) => ({
      id: row.id,
      category_id: row.category_id,
      h1_tag: row.h1_tag,
      slug: row.slug,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      author_id: row.author_id,
      title: row.title,
      short_description: row.short_description,
      author_name: row.author_name,
      author_details: row.author_details || row.author_details,
      author_image: row.image,
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

  async findAllByCategorySlug(
    page: number,
    limit: number,
    categorySlug: string,
    options: { search?: string } = {}
  ): Promise<{ data: News[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [];

    where.push("nc.category_slug = ?");
    params.push(categorySlug);

    if (options.search && options.search.trim()) {
      where.push("(n.title LIKE ? OR n.h1_tag LIKE ? OR a.author_name LIKE ? OR n.author_name LIKE ?)");
      const searchTerm = `%${options.search.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total 
       FROM news n
       INNER JOIN news_categories nc ON n.category_id = nc.id
       ${whereClause}`,
      params
    );
    const total = countRows[0].total;

    const [rows]: any = await pool.query(
      `SELECT 
        n.id,
        n.category_id,
        n.h1_tag,
        n.slug,
        n.meta_title,
        n.meta_description,
        n.author_id,
        n.title,
        n.short_description,
        a.author_name,
        a.author_details,
        a.image as author_image,
        n.thumbnail,
        n.verified,
        n.update_date,
        n.content,
        n.created_at,
        n.updated_at,
        nc.title as category_title,
        nc.category_slug as category_slug,
        nc.category_summary as category_summary
      FROM news n
      INNER JOIN news_categories nc ON n.category_id = nc.id
      LEFT JOIN authors a ON n.author_id = a.id 
      ${whereClause}
      ORDER BY n.id DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const data = rows.map((row: any) => ({
      id: row.id,
      category_id: row.category_id,
      h1_tag: row.h1_tag,
      slug: row.slug,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      author_id: row.author_id,
      title: row.title,
      short_description: row.short_description,
      author_name: row.author_name,
      author_details: row.author_details || row.author_details,
      author_image: row.image || row.author_image,
      thumbnail: row.thumbnail,
      verified: Boolean(row.verified),
      update_date: row.update_date,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_title: row.category_title,
      category_slug: row.category_slug,
      category_summary: row.category_summary,
    }));

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findBySlug(slug: string): Promise<News | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        n.id,
        n.category_id,
        n.h1_tag,
        n.slug,
        n.meta_title,
        n.meta_description,
        n.author_id,
        n.title,
        n.short_description,
        a.author_name,
        a.author_details,
        a.image as author_image,
        a.author_slug,
        a.label,
        n.thumbnail,
        n.verified,
        n.update_date,
        n.content,
        n.created_at,
        n.updated_at,
        nc.title as category_title,
        nc.category_slug as category_slug
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      LEFT JOIN authors a ON n.author_id = a.id
      WHERE n.slug = ?`,
      [slug]
    );
    if (!rows.length) return null;
    const [relatedRows]: any = await pool.query(
      `SELECT * FROM news WHERE category_id = ? ORDER BY created_at DESC limit 6`,
      [rows[0].category_id]
    );
    const relatedNewsData = relatedRows.map((row: any) => ({
      id: row.id,
      h1_tag: row.h1_tag,
      slug: row.slug,
      thumbnail: row.thumbnail,
      short_description: row.short_description,
      updated_at: row.updated_at,
    }));

    const row = rows[0];
    return {
      id: row.id,
      category_id: row.category_id,
      h1_tag: row.h1_tag,
      slug: row.slug,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      author_id: row.author_id,
      title: row.title,
      short_description: row.short_description,
      author_name: row.author_name || row.author_name,
      author_details: row.author_details || row.author_details,
      author_image: row.author_image,
      author_slug: row.author_slug,
      label: row.label,
      thumbnail: row.thumbnail,
      verified: Boolean(row.verified),
      update_date: row.update_date,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_title: row.category_title,
      category_slug: row.category_slug,
      related_news: relatedNewsData,
    } as News;
  }

  async findById(id: number): Promise<News | null> {
    const [rows]: any = await pool.query(
      `SELECT 
        n.id,
        n.category_id,
        n.h1_tag,
        n.slug,
        n.meta_title,
        n.meta_description,
        n.author_id,
        n.title,
        n.short_description,
        a.author_name,
        a.author_details,
        a.image as author_image,
        a.author_slug,
        a.label,
        n.thumbnail,
        n.verified,
        n.update_date,
        n.content,
        n.created_at,
        n.updated_at,
        nc.title as category_title,
        nc.category_slug as category_slug
      FROM news n
      LEFT JOIN news_categories nc ON n.category_id = nc.id
      LEFT JOIN authors a ON n.author_id = a.id
      WHERE n.id = ?`,
      [id]
    );
    if (!rows.length) return null;

    const row = rows[0];
    return {
      id: row.id,
      category_id: row.category_id,
      h1_tag: row.h1_tag,
      slug: row.slug,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      author_id: row.author_id,
      title: row.title,
      short_description: row.short_description,
      author_name: row.author_name || row.author_name,
      author_details: row.author_details || row.author_details,
      author_image: row.image || row.author_image,
      author_slug: row.author_slug,
      label: row.label,
      thumbnail: row.thumbnail,
      verified: Boolean(row.verified),
      update_date: row.update_date,
      content: row.content,
      created_at: row.created_at,
      updated_at: row.updated_at,
      category_title: row.category_title,
      category_slug: row.category_slug,
    } as News;
  }

  async create(item: Omit<News, "id" | "created_at" | "updated_at">): Promise<News> {
    const [result]: any = await pool.query(
      `INSERT INTO news (
        category_id, h1_tag, slug, meta_title, meta_description, author_id,
        title, short_description, author_name, thumbnail, verified, update_date, content, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,NOW(), NOW())`,
      [
        item.category_id,
        item.h1_tag ?? null,
        item.slug ?? null,
        item.meta_title ?? null,
        item.meta_description ?? null,
        item.author_id ?? null,
        item.title,
        item.short_description ?? null,
        item.author_name ?? null,
        item.thumbnail ?? null,
        item.verified ? 1 : 0,
        item.update_date ?? null,
        item.content ?? null,
      ]
    );
    const [createdRows]: any = await pool.query("SELECT * FROM news WHERE id=?", [result.insertId]);
    return createdRows[0] as News;
  }

  async update(
    id: number,
    item: Partial<News> & { saveWithDate?: boolean }
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = new Set([
      "category_id",
      "h1_tag",
      "slug",
      "meta_title",
      "meta_description",
      "author_id",
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
        fields.push(`${key} = ?`);
        values.push(value);
      } else {
        fields.push(`${key} = ?`);
        values.push(value ?? null);
      }
    }

    if (item.saveWithDate) {
      fields.push("updated_at = NOW()");
    } else {
      fields.push("updated_at = updated_at");
    }

    if (!fields.length) return false;

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE news SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM news WHERE id=?", [id]);
  }
}
