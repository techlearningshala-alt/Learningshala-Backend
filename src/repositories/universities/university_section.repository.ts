import pool from "../../config/db";

export default class UniversitySectionRepository {
  static async create(data: any) {
    const [result]: any = await pool.query(
      "INSERT INTO university_sections (university_id, title, component, props) VALUES (?, ?, ?, ?)",
      [data.university_id, data.title, data.component, JSON.stringify(data.props)]
    );
    const [section]: any = await pool.query("SELECT * FROM university_sections WHERE id = ?", [result.insertId]);
    return section[0];
  }

  static async findByUniversity(universityId: number) {
    const [rows]: any = await pool.query(
      "SELECT * FROM university_sections WHERE university_id = ? ORDER BY id ASC",
      [universityId]
    );
    return rows;
  }

  static async update(id: number, data: any) {
    await pool.query(
      "UPDATE university_sections SET title = ?, component = ?, props = ? WHERE id = ?",
      [data.title, data.component, JSON.stringify(data.props), id]
    );
    const [updated]: any = await pool.query("SELECT * FROM university_sections WHERE id = ?", [id]);
    return updated[0];
  }

  static async remove(id: number) {
    const [result]: any = await pool.query("DELETE FROM university_sections WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
