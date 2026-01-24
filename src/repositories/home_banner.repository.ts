import pool from "../config/db";
import { HomeBanner, CreateHomeBannerDto, UpdateHomeBannerDto } from "../models/home_banner.model";

export class HomeBannerRepository {
  async findAll(page = 1, limit = 10): Promise<{ data: HomeBanner[]; total: number; page: number; pages: number }> {
    const offset = (page - 1) * limit;
    const [rows]: any = await pool.query(
      "SELECT SQL_CALC_FOUND_ROWS * FROM home_banners ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    const [[{ "FOUND_ROWS()": total }]]: any = await pool.query("SELECT FOUND_ROWS()");
    return { data: rows, page, pages: Math.ceil(total / limit), total };
  }

  async findById(id: number): Promise<HomeBanner | null> {
    const [rows]: any = await pool.query("SELECT * FROM home_banners WHERE id = ?", [id]);
    return rows.length ? rows[0] : null;
  }

  async create(payload: CreateHomeBannerDto): Promise<HomeBanner> {
    const [result]: any = await pool.query(
      `INSERT INTO home_banners (banner_image, video_id, video_title, url) VALUES (?, ?, ?, ?)`,
      [payload.banner_image, payload.video_id, payload.video_title, payload.url]
    );
    return this.findById(result.insertId) as Promise<HomeBanner>;
  }

  async update(id: number, payload: UpdateHomeBannerDto, saveWithDate: boolean): Promise<HomeBanner | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (payload.banner_image !== undefined) {
      fields.push("banner_image = ?");
      values.push(payload.banner_image);
    }
    if (payload.video_id !== undefined) {
      fields.push("video_id = ?");
      values.push(payload.video_id);
    }
    if (payload.video_title !== undefined) {
      fields.push("video_title = ?");
      values.push(payload.video_title);
    }
    if (payload.url !== undefined) {
      fields.push("url = ?");
      values.push(payload.url);
    }

    if (saveWithDate) {
      fields.push("updated_at = NOW()");
    } else {
      fields.push("updated_at = updated_at"); // Prevent auto-update if not explicitly saving with date
    }

    if (fields.length === 0) {
      return this.findById(id); // No changes, return existing
    }

    values.push(id);
    await pool.query(
      `UPDATE home_banners SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const [result]: any = await pool.query("DELETE FROM home_banners WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

export default new HomeBannerRepository();
