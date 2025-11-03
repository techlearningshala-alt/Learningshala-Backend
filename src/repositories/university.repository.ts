import pool from "../config/db";
import { University } from "../models/university.model";

export class UniversityRepository {
  async findAll(): Promise<University[]> {
    const [rows] = await pool.query("SELECT * FROM universities ORDER BY created_at DESC");
    return rows as University[];
  }

  async findById(id: number): Promise<University | null> {
    const [rows] = await pool.query("SELECT * FROM universities WHERE id=?", [id]);
    const data = rows as University[];
    return data.length ? data[0] : null;
  }

  async create(item: Omit<University, "id" | "created_at" | "updated_at">): Promise<void> {
    await pool.query(
      "INSERT INTO universities (name, university_logo, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [item.name, item.university_logo]
    );
  }

  async update(id: number, item: Partial<University>): Promise<void> {
    await pool.query(
      "UPDATE universities SET name=?, university_logo=?, updated_at=NOW() WHERE id=?",
      [item.name, item.university_logo, id]
    );
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM universities WHERE id=?", [id]);
  }
}
