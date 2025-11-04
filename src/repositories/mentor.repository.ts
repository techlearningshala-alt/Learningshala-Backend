import pool from "../config/db";
import { Mentor } from "../models/mentor.model";

export class MentorRepository {
  async findAll(limit: number, offset: number): Promise<Mentor[]> {
    const [rows] = await pool.query(
      "SELECT * FROM mentors ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    return rows as Mentor[];
  }

  async count(): Promise<number> {
    const [rows]: any = await pool.query("SELECT COUNT(*) as total FROM mentors");
    return rows[0].total;
  }
  async findById(id: number): Promise<Mentor | null> {
    const [rows] = await pool.query("SELECT * FROM mentors WHERE id=?", [id]);
    const data = rows as Mentor[];
    return data.length ? data[0] : null;
  }

 async create(item: Omit<Mentor, "id" | "created_at" | "updated_at">): Promise<Mentor> {
  const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await pool.query<any>(
      `INSERT INTO mentors 
      (name, thumbnail, experience, verified, assist_student, connection_link, label, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        item.name,
        item.thumbnail,
        item.experience,
        item.verified,
        item.assist_student,
        item.connection_link,
        item.label,
        createdAt
        // item.status, // if you have a status field
      ]
    );

    // result.insertId contains the newly created mentor ID
    const [rows] : any = await pool.query("SELECT * FROM mentors WHERE id = ?", [result.insertId]);
    return rows[0] as Mentor;
  }

async update(
  id: number,
  item: Partial<Mentor>,
  saveWithDate: boolean
): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  // Add all fields except saveWithDate
  for (const [key, value] of Object.entries(item)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length === 0) return false;

  // Only update updated_at if saveWithDate is true
  console.log(typeof(saveWithDate),"save")
  console.log(saveWithDate,"save")
  if (saveWithDate) fields.push("updated_at = NOW()");

  values.push(id);

  const [result]: any = await pool.query(
    `UPDATE mentors SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return result.affectedRows > 0;
}



  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM mentors WHERE id=?", [id]);
  }
}
