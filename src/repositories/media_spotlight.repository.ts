import pool from "../config/db";
import { MediaSpotlight } from "../models/media_spotlight.model";

export class MediaSpotlightRepository {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows] = await pool.query("SELECT * FROM media_spotlight ORDER BY created_at DESC LIMIT ? OFFSET ?", [limit, offset]);
    const [row]: any = await pool.query("SELECT COUNT(*) as total FROM media_spotlight");
    const total =  row[0].total;
    return { data: rows, page, pages: Math.ceil(total / limit), total };
    // return rows as MediaSpotlight[];
  }

  //  async findAll(page = 1, limit = 10) {
  //   const offset = (page - 1) * limit;
  //   const [rows]: any = await pool.query(
  //     "SELECT SQL_CALC_FOUND_ROWS * FROM student_testimonials ORDER BY id DESC LIMIT ? OFFSET ?",
  //     [limit, offset]
  //   );
  //   const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");
  //   return { data: rows, page, pages: Math.ceil(total / limit), total };
  // }

  async findById(id: number): Promise<MediaSpotlight | null> {
    const [rows] = await pool.query("SELECT * FROM media_spotlight WHERE id=?", [id]);
    const data = rows as MediaSpotlight[];
    return data.length ? data[0] : null;
  }

  async create(item: Omit<MediaSpotlight, "id" | "created_at" | "updated_at">): Promise<void> {
    await pool.query(
      "INSERT INTO media_spotlight (title, logo, link, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
      [item.title, item.logo, item.link]
    );
  }

  async reorder(order: { id: number; position: number }[]): Promise<void> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      for (const { id, position } of order) {
        await conn.query(
          `UPDATE media_spotlight SET position = ? WHERE id = ?`,
          [position, id]
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }


  async update(
    id: number,
    item: Partial<MediaSpotlight>,
    saveWithDate: boolean
  ): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];


    if (item.title !== undefined && item.title !== null) {
      fields.push("title = ?");
      values.push(item.title);
    }

    if (item.logo !== undefined && item.logo !== null) {
      fields.push("logo = ?");
      values.push(item.logo);
    }

    if (item.link !== undefined && item.link !== null) {
      fields.push("link = ?");
      values.push(item.link);
    }
    console.log(typeof (saveWithDate), "itemsss")
    console.log(saveWithDate, "itemsss")
    if (saveWithDate) fields.push("updated_at = NOW()");
    console.log(saveWithDate, "itemsss")


    if (!fields.length) return;

    values.push(id);

    await pool.query(
      `UPDATE media_spotlight SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM media_spotlight WHERE id=?", [id]);
  }
}
