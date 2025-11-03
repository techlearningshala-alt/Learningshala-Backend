import pool from "../../config/db";
import { UniversitySpecialization } from "../../models/universities/university_specialization.model";

export default class UniversitySpecializationRepository {
  async findAllByUniversityCourse(universityCourseId: number) {
    const [rows]: any = await pool.query(
      `SELECT us.*, s.name as specialization_name 
       FROM university_specializations us 
       JOIN specializations s ON us.specialization_id = s.id
       WHERE us.university_course_id = ? ORDER BY us.id DESC`,
      [universityCourseId]
    );
    return rows;
  }

  async create(spec: Omit<UniversitySpecialization, "id" | "created_at" | "updated_at">) {
    const [result]: any = await pool.query(
      "INSERT INTO university_specializations (university_course_id, specialization_id) VALUES (?, ?)",
      [spec.university_course_id, spec.specialization_id]
    );
    return { id: result.insertId, ...spec };
  }

  async delete(id: number) {
    const [result]: any = await pool.query("DELETE FROM university_specializations WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
