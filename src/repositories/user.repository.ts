import pool from "../config/db";
import { User } from "../models/user.model";

export class UserRepository {
  async findById(id: number): Promise<User | null> {
    const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    console.log([rows], "rows")
    return rows[0] || null;
  }

  async create(user: { name: string; email: string; password: string; role?: string }): Promise<User> {
    const [res]: any = await pool.query(
      "INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
      [user.name, user.email, user.password, user.role || "user"]
    );
    const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [res.insertId]);
    return rows[0];
  }
}
export default new UserRepository();
