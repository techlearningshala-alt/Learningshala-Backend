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

  async findBySlug(slug: string): Promise<Author | null> {
    const [authorRows]: any = await pool.query("SELECT * FROM authors WHERE author_slug = ?", [slug]);
    if (!authorRows.length) return null;

    const a = authorRows[0];

    const [blogRows]: any = await pool.query(
      `SELECT b.h1_tag AS blog_title, b.short_description AS blog_short_description, b.thumbnail AS blog_thumbnail,
              b.slug AS blog_slug, b.verified AS blog_verified, b.updated_at AS blog_updated_at,
              b.meta_title AS blog_meta_title, b.meta_description AS blog_meta_description,
              bc.title AS category_title
       FROM blogs b
       LEFT JOIN blog_categories bc ON b.category_id = bc.id
       WHERE b.author_id = ?
       ORDER BY b.id DESC`,
      [a.id]
    );

    const [newsRows]: any = await pool.query(
      `SELECT n.h1_tag AS news_h1_tag, n.short_description AS news_short_description, n.thumbnail AS news_thumbnail,
              n.slug AS news_slug, n.verified AS news_verified, n.updated_at AS news_updated_at,
              n.meta_title AS news_meta_title, n.meta_description AS news_meta_description,
              nc.title AS category_title
       FROM news n
       LEFT JOIN news_categories nc ON n.category_id = nc.id
       WHERE n.author_id = ?
       ORDER BY n.id DESC`,
      [a.id]
    );

    const author_blogs = (blogRows as any[]).map((row) => ({
      h1_tag: row.blog_title,
      short_description: row.blog_short_description,
      thumbnail: row.blog_thumbnail,
      slug: row.blog_slug,
      verified: row.blog_verified == null ? null : Boolean(row.blog_verified),
      updated_at: row.blog_updated_at,
      meta_title: row.blog_meta_title,
      meta_description: row.blog_meta_description,
      category_title: row.category_title,
    }));

    const author_news = (newsRows as any[]).map((row) => ({
      h1_tag: row.news_h1_tag,
      short_description: row.news_short_description,
      thumbnail: row.news_thumbnail,
      slug: row.news_slug,
      verified: row.news_verified == null ? null : Boolean(row.news_verified),
      updated_at: row.news_updated_at,
      meta_title: row.news_meta_title,
      meta_description: row.news_meta_description,
      category_title: row.category_title,
    }));

    return {
      id: a.id,
      author_name: a.author_name,
      image: a.image,
      author_details: a.author_details,
      label: a.label,
      author_slug: a.author_slug,
      meta_title: a.meta_title,
      meta_description: a.meta_description,
      linkedin_profile_link: a.linkedin_profile_link,
      designation: a.designation,
      education_background: a.education_background,
      created_at: a.created_at,
      updated_at: a.updated_at,
      author_blogs,
      author_news,
    };
  }

  async create(item: CreateAuthorDto): Promise<Author> {
    const [result]: any = await pool.query(
      `INSERT INTO authors (author_name, image, author_details, label, author_slug, meta_title, meta_description, linkedin_profile_link, designation, education_background) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.author_name, item.image, item.author_details, item.label, item.author_slug, item.meta_title, item.meta_description, item.linkedin_profile_link, item.designation, item.education_background]
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
    if (item.meta_title !== undefined) {
      fields.push("meta_title = ?");
      values.push(item.meta_title);
    }
    if (item.meta_description !== undefined) {
      fields.push("meta_description = ?");
      values.push(item.meta_description);
    }
    if (item.linkedin_profile_link !== undefined) {
      fields.push("linkedin_profile_link = ?");
      values.push(item.linkedin_profile_link);
    }
    if (item.designation !== undefined) {
      fields.push("designation = ?");
      values.push(item.designation);
    }
    if (item.education_background !== undefined) {
      fields.push("education_background = ?");
      values.push(item.education_background);
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
