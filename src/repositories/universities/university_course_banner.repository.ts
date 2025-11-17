import pool from "../../config/db";

export interface CourseBannerRecord {
  id: number;
  course_id: number;
  banner_key: string;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface UpsertCourseBannerPayload {
  banner_key?: string;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
}

class UniversityCourseBannerRepository {
  private readonly defaultKey = "primary";

  async findByCourseId(courseId: number): Promise<CourseBannerRecord[]> {
    const [rows]: any = await pool.query(
      `SELECT *
         FROM university_course_banners
        WHERE course_id = ?
        ORDER BY id ASC`,
      [courseId]
    );
    return rows;
  }

  async findPrimary(courseId: number): Promise<CourseBannerRecord | null> {
    const key = this.defaultKey;
    const [rows]: any = await pool.query(
      `SELECT *
         FROM university_course_banners
        WHERE course_id = ? AND banner_key = ?
        LIMIT 1`,
      [courseId, key]
    );
    return rows.length ? rows[0] : null;
  }

  async upsert(courseId: number, payload: UpsertCourseBannerPayload): Promise<CourseBannerRecord> {
    const key = payload.banner_key || this.generateBannerKey(courseId);

    const existing = await this.findByKey(courseId, key);

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
        values.push(courseId, key);
        await pool.query(
          `UPDATE university_course_banners
              SET ${fields.join(", ")}, updated_at = NOW()
            WHERE course_id = ? AND banner_key = ?`,
          values
        );
      }

      return (await this.findByKey(courseId, key))!;
    }

    const [result]: any = await pool.query(
      `INSERT INTO university_course_banners
        (course_id, banner_key, banner_image, video_id, video_title)
       VALUES (?, ?, ?, ?, ?)`
    , [
      courseId,
      key,
      payload.banner_image ?? null,
      payload.video_id ?? null,
      payload.video_title ?? null,
    ]);

    const [row]: any = await pool.query(
      `SELECT * FROM university_course_banners WHERE id = ? LIMIT 1`,
      [result.insertId]
    );
    return row[0];
  }

  async findByKey(courseId: number, bannerKey: string): Promise<CourseBannerRecord | null> {
    const [rows]: any = await pool.query(
      `SELECT *
         FROM university_course_banners
        WHERE course_id = ? AND banner_key = ?
        LIMIT 1`,
      [courseId, bannerKey]
    );
    return rows.length ? rows[0] : null;
  }

  private generateBannerKey(courseId: number): string {
    return `banner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async remove(courseId: number, bannerKey: string): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM university_course_banners
        WHERE course_id = ? AND banner_key = ?`,
      [courseId, bannerKey]
    );
    return result.affectedRows > 0;
  }

  async removeAll(courseId: number): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM university_course_banners WHERE course_id = ?`,
      [courseId]
    );
    return result.affectedRows > 0;
  }
}

export default new UniversityCourseBannerRepository();
