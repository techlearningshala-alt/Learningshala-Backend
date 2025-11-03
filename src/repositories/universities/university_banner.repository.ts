import pool from "../../config/db";

export default class UniversityBannerRepository {
  static async create(data: any) {
    const [result]: any = await pool.query(
      "INSERT INTO university_banners (university_id, image, videoId, videoTitle) VALUES (?, ?, ?, ?)",
      [data.university_id, data.image, data.videoId, data.videoTitle]
    );
    const [banner]: any = await pool.query("SELECT * FROM university_banners WHERE id = ?", [result.insertId]);
    return banner[0];
  }

  static async findByUniversity(universityId: number) {
    const [rows]: any = await pool.query(
      "SELECT * FROM university_banners WHERE university_id = ? ORDER BY id DESC",
      [universityId]
    );
    return rows;
  }

  static async update(id: number, data: any) {
    await pool.query(
      "UPDATE university_banners SET image = ?, videoId = ?, videoTitle = ? WHERE id = ?",
      [data.image, data.videoId, data.videoTitle, id]
    );
    const [updated]: any = await pool.query("SELECT * FROM university_banners WHERE id = ?", [id]);
    return updated[0];
  }

  static async remove(id: number) {
    const [result]: any = await pool.query("DELETE FROM university_banners WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
