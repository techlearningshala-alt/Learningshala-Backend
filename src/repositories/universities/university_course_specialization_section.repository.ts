import pool from "../../config/db";

export default class UniversityCourseSpecializationSectionRepository {
  static async create(data: any) {
    const [result]: any = await pool.query(
      "INSERT INTO university_course_specialization_sections (specialization_id, section_key, title, component, props) VALUES (?, ?, ?, ?, ?)",
      [data.specialization_id, data.section_key, data.title, data.component, JSON.stringify(data.props)]
    );
    const [section]: any = await pool.query("SELECT * FROM university_course_specialization_sections WHERE id = ?", [result.insertId]);
    return section[0];
  }

  static async findBySpecializationId(specializationId: number) {
    const [rows]: any = await pool.query(
      "SELECT * FROM university_course_specialization_sections WHERE specialization_id = ? ORDER BY id ASC",
      [specializationId]
    );
    return rows;
  }

  static async update(id: number, data: any) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.section_key !== undefined) {
      fields.push("section_key = ?");
      values.push(data.section_key);
    }
    if (data.component !== undefined) {
      fields.push("component = ?");
      values.push(data.component);
    }
    if (data.props !== undefined) {
      fields.push("props = ?");
      values.push(JSON.stringify(data.props));
    }

    if (fields.length) {
      values.push(id);
      await pool.query(
        `UPDATE university_course_specialization_sections SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
        values
      );
    }

    const [updated]: any = await pool.query("SELECT * FROM university_course_specialization_sections WHERE id = ?", [id]);
    return updated[0];
  }

  static async remove(id: number) {
    const [result]: any = await pool.query("DELETE FROM university_course_specialization_sections WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async removeBySpecializationId(specializationId: number) {
    const [result]: any = await pool.query("DELETE FROM university_course_specialization_sections WHERE specialization_id = ?", [specializationId]);
    return result.affectedRows > 0;
  }
}

