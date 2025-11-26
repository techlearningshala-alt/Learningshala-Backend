import pool from "../../config/db";
import { UniversityApproval } from "../../models/universities/university_approval.model";

export class UniversityApprovalRepository {
  async findAll(limit: number, offset: number): Promise<UniversityApproval[]> {
    const [rows] = await pool.query(
      "SELECT * FROM university_approvals ORDER BY id ASC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    return rows as UniversityApproval[];
  }

  async count(): Promise<number> {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM university_approvals");
    return (rows as any)[0].count;
  }

   async find(): Promise<any | null> {
    const [rows] = await pool.query("SELECT id ,title FROM university_approvals");
    return rows as UniversityApproval[];
  }

  async findById(id: number): Promise<UniversityApproval | null> {
    const [rows] = await pool.query("SELECT * FROM university_approvals WHERE id = ?", [id]);
    const data = rows as UniversityApproval[];
    return data.length ? data[0] : null;
  }

  async create(data: Partial<UniversityApproval>): Promise<any> {
    const [result] = await pool.query(
      "INSERT INTO university_approvals (title, description, logo) VALUES (?, ?, ?)",
      [data.title, data.description, data.logo || null]
    );
    return result;
  }

  async update(id: number, data: Partial<UniversityApproval>): Promise<any> {
    const fields = [];
    const values: any[] = [];

    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push((data as any)[key]);
    }

    values.push(id);

    const [result] = await pool.query(
      `UPDATE university_approvals SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return result;
  }

  async delete(id: number): Promise<any> {
    const [result] = await pool.query("DELETE FROM university_approvals WHERE id = ?", [id]);
    return result;
  }
}
