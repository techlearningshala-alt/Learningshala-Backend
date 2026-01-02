import pool from "../../config/db";
import { UniversityType } from "../../models/universities/university_types.model";

export class UniversityTypesRepository {
  async findAll(page: number, limit: number): Promise<{ data: UniversityType[]; total: number; page: number; limit: number }> {
    const offset = (page - 1) * limit;

    // Fetch total count
    const [countRows] = await pool.query("SELECT COUNT(*) as total FROM university_types");
    const total = (countRows as any)[0].total;

    // Fetch paginated data
    const [rows] = await pool.query(
      "SELECT * FROM university_types ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    return {
      data: rows as UniversityType[],
      total,
      page,
      limit,
    };
  }

  async findById(id: number): Promise<UniversityType | null> {
    const [rows] = await pool.query("SELECT * FROM university_types WHERE id=?", [id]);
    const data = rows as UniversityType[];
    return data.length ? data[0] : null;
  }

  async create(item: Omit<UniversityType, "id" | "created_at" | "updated_at">): Promise<UniversityType> {
    const [result]: any = await pool.query(
      `INSERT INTO university_types (name, created_at, updated_at) VALUES (?, NOW(), NOW())`,
      [item.name]
    );
    const [rows]: any = await pool.query("SELECT * FROM university_types WHERE id=?", [result.insertId]);
    return rows[0] as UniversityType;
  }

  async update(id: number, item: Partial<UniversityType> & { saveWithDate?: boolean }): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const allowedFields = new Set(["name"]);

    for (const [key, value] of Object.entries(item)) {
      if (key === "saveWithDate") continue;
      if (!allowedFields.has(key)) continue;
      fields.push(`${key} = ?`);
      values.push(value);
    }

    // Only update updated_at if saveWithDate === true
    if (item.saveWithDate) {
      fields.push("updated_at = NOW()");
    } else {
      // Prevent updated_at from being auto-updated
      fields.push("updated_at = updated_at");
    }

    if (!fields.length) return false;

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE university_types SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM university_types WHERE id=?", [id]);
  }
}

