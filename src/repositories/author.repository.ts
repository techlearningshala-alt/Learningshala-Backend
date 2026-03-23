import pool from "../config/db";
import { Author, CreateAuthorDto, UpdateAuthorDto } from "../models/author.model";
import { Blog } from "../models/blogs/blog.model";

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

  async findBySlug(slug: string): Promise<Author | null> {
    const [rows]: any = await pool.query("SELECT authors.id, authors.author_name, authors.image, authors.author_details, authors.label, authors.author_slug, b.h1_tag as blog_title, b.short_description as blog_short_description, b.thumbnail as blog_thumbnail , b.slug as blog_slug,b.verified as blog_verified, b.updated_at as blog_updated_at, b.meta_title as blog_meta_title, b.meta_description as blog_meta_description FROM authors left join blogs b on authors.id = b.author_id WHERE author_slug = ?", [slug]);
    const author_blogs: { title: string | null, short_description: string | null, thumbnail: string | null, slug: string | null, verified: boolean | null, update_date: Date | null, meta_title: string | null, meta_description: string | null }[] = rows.map((row: any) => ({
      h1_tag: row.blog_title,
      short_description: row.blog_short_description,
      thumbnail: row.blog_thumbnail,
      slug: row.blog_slug,
      verified: row.blog_verified,
      update_at: row.blog_updated_at,
      meta_title: row.blog_meta_title,
      meta_description: row.blog_meta_description,
    }));
    return rows.length ? { id: rows[0].id, author_name: rows[0].author_name, image: rows[0].image, author_details: rows[0].author_details, label: rows[0].label, author_slug: rows[0].author_slug, created_at: rows[0].created_at, updated_at: rows[0].updated_at, author_blogs } : null;
  }

  async create(item: CreateAuthorDto): Promise<Author> {
    const [result]: any = await pool.query(
      `INSERT INTO authors (author_name, image, author_details, label, author_slug) VALUES (?, ?, ?, ?, ?)`,
      [item.author_name, item.image, item.author_details, item.label, item.author_slug]
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
    if (item.author_slug !== undefined) {
      fields.push("author_slug = ?");
      values.push(item.author_slug);
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
