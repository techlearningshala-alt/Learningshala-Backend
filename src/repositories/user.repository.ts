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

  async create(user: { 
    name: string; 
    email: string; 
    password: string; 
    role?: string;
    phone?: string | null;
    course?: string | null;
    state?: string | null;
    city?: string | null;
      otp?: number | null;
  }): Promise<User> {
    const [res]: any = await pool.query(
      "INSERT INTO users (name, email, password, role, phone, course, state, city, otp, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
        user.name, 
        user.email, 
        user.password, 
        user.role || "user",
        user.phone || null,
        user.course || null,
        user.state || null,
        user.city || null,
        user.otp || null
      ]
    );
    const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [res.insertId]);
    return rows[0];
  }

  async update(id: number, user: {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    phone?: string | null;
    course?: string | null;
    state?: string | null;
    city?: string | null;
    otp?: number | null | undefined ;
  }): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (user.name !== undefined) {
      fields.push("name = ?");
      values.push(user.name);
    }
    if (user.email !== undefined) {
      fields.push("email = ?");
      values.push(user.email);
    }
    if (user.password !== undefined) {
      fields.push("password = ?");
      values.push(user.password);
    }
    if (user.role !== undefined) {
      fields.push("role = ?");
      values.push(user.role);
    }
    if (user.phone !== undefined) {
      fields.push("phone = ?");
      values.push(user.phone);
    }
    if (user.course !== undefined) {
      fields.push("course = ?");
      values.push(user.course);
    }
    if (user.state !== undefined) {
      fields.push("state = ?");
      values.push(user.state);
    }
    if (user.city !== undefined) {
      fields.push("city = ?");
      values.push(user.city);
    }
    if (user.otp !== undefined) {
      fields.push("otp = ?");
      values.push(user.otp);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push("updated_at = NOW()");
    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return null;
    }

    const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  }
}
export default new UserRepository();
