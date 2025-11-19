import pool from "../../config/db";

export interface SpecializationBannerRecord {
  id: number;
  specialization_id: number;
  banner_key: string;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpsertSpecializationBannerPayload {
  banner_key?: string;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
}

class UniversityCourseSpecializationBannerRepository {
  private readonly defaultKey = "primary";

  async findBySpecializationId(specializationId: number): Promise<SpecializationBannerRecord[]> {
    const [rows]: any = await pool.query(
      `SELECT *
         FROM university_course_specialization_banners
        WHERE specialization_id = ?
        ORDER BY id ASC`,
      [specializationId]
    );
    return rows;
  }

  async findPrimary(specializationId: number): Promise<SpecializationBannerRecord | null> {
    const key = this.defaultKey;
    const [rows]: any = await pool.query(
      `SELECT *
         FROM university_course_specialization_banners
        WHERE specialization_id = ? AND banner_key = ?
        LIMIT 1`,
      [specializationId, key]
    );
    return rows.length ? rows[0] : null;
  }

  async upsert(specializationId: number, payload: UpsertSpecializationBannerPayload): Promise<SpecializationBannerRecord> {
    const key = payload.banner_key || this.generateBannerKey(specializationId);

    const existing = await this.findByKey(specializationId, key);

    if (existing) {
      const fields: string[] = [];
      const values: any[] = [];

      if (payload.banner_image !== undefined) {
        fields.push("banner_image = ?");
        values.push(payload.banner_image ?? null);
      }
      if (payload.video_id !== undefined) {
        fields.push("video_id = ?");
        values.push(payload.video_id ?? null);
      }
      if (payload.video_title !== undefined) {
        fields.push("video_title = ?");
        values.push(payload.video_title ?? null);
      }

      if (fields.length) {
        values.push(specializationId, key);
        await pool.query(
          `UPDATE university_course_specialization_banners
              SET ${fields.join(", ")}, updated_at = NOW()
            WHERE specialization_id = ? AND banner_key = ?`,
          values
        );
      }

      return (await this.findByKey(specializationId, key))!;
    }

    const [result]: any = await pool.query(
      `INSERT INTO university_course_specialization_banners
        (specialization_id, banner_key, banner_image, video_id, video_title)
       VALUES (?, ?, ?, ?, ?)`
    , [
      specializationId,
      key,
      payload.banner_image ?? null,
      payload.video_id ?? null,
      payload.video_title ?? null,
    ]);

    const [row]: any = await pool.query(
      `SELECT * FROM university_course_specialization_banners WHERE id = ? LIMIT 1`,
      [result.insertId]
    );
    return row[0];
  }

  async findByKey(specializationId: number, bannerKey: string): Promise<SpecializationBannerRecord | null> {
    const [rows]: any = await pool.query(
      `SELECT *
         FROM university_course_specialization_banners
        WHERE specialization_id = ? AND banner_key = ?
        LIMIT 1`,
      [specializationId, bannerKey]
    );
    return rows.length ? rows[0] : null;
  }

  private generateBannerKey(specializationId: number): string {
    return `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async remove(specializationId: number, bannerKey: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM university_course_specialization_banners
        WHERE specialization_id = ? AND banner_key = ?`,
      [specializationId, bannerKey]
    );
    return result.affectedRows > 0;
  }

  async removeAll(specializationId: number): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM university_course_specialization_banners WHERE specialization_id = ?`,
      [specializationId]
    );
    return result.affectedRows > 0;
  }
}

export default new UniversityCourseSpecializationBannerRepository();

