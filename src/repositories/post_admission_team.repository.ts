import pool from "../config/db";
import { PostAdmissionTeamMember } from "../models/post_admission_team.model";

const UPDATE_KEYS = new Set([
  "name",
  "thumbnail",
  "experience",
  "verified",
  "assist_student",
  "qualification",
  "connection_link",
  "label",
]);

export class PostAdmissionTeamRepository {
  async findAll(limit: number, offset: number): Promise<PostAdmissionTeamMember[]> {
    const [rows] = await pool.query(
      "SELECT * FROM post_admission_team ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    return rows as PostAdmissionTeamMember[];
  }

  async count(): Promise<number> {
    const [rows]: any = await pool.query("SELECT COUNT(*) as total FROM post_admission_team");
    return rows[0].total;
  }

  async findById(id: number): Promise<PostAdmissionTeamMember | null> {
    const [rows] = await pool.query("SELECT * FROM post_admission_team WHERE id = ?", [id]);
    const data = rows as PostAdmissionTeamMember[];
    return data.length ? data[0] : null;
  }

  async create(
    item: Omit<PostAdmissionTeamMember, "id" | "created_at" | "updated_at">
  ): Promise<PostAdmissionTeamMember> {
    const [result] = await pool.query<any>(
      `INSERT INTO post_admission_team
      (name, thumbnail, experience, verified, assist_student, qualification, connection_link, label, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        item.name,
        item.thumbnail,
        item.experience,
        item.verified ? 1 : 0,
        item.assist_student ?? 0,
        item.qualification ?? null,
        item.connection_link ?? null,
        item.label ?? null,
      ]
    );

    const [rows]: any = await pool.query("SELECT * FROM post_admission_team WHERE id = ?", [
      result.insertId,
    ]);
    return rows[0] as PostAdmissionTeamMember;
  }

  async update(
    id: number,
    item: Partial<PostAdmissionTeamMember>,
    saveWithDate: boolean
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];

    const toMySQLDateTime = (val: unknown) => {
      if (typeof val === "string" && val.includes("T")) {
        const date = new Date(val);
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 19).replace("T", " ");
        }
      }
      return val;
    };

    for (const [key, value] of Object.entries(item)) {
      if (!UPDATE_KEYS.has(key)) continue;
      fields.push(`${key} = ?`);
      let v: unknown = value;
      if (key === "verified") v = value ? 1 : 0;
      if (key === "assist_student" && (value === "" || value == null)) v = 0;
      if (key === "qualification" && value === "") v = null;
      values.push(toMySQLDateTime(v));
    }

    if (fields.length === 0) return false;
    if (saveWithDate) fields.push("updated_at = NOW()");
    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE post_admission_team SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM post_admission_team WHERE id = ?", [id]);
  }
}
