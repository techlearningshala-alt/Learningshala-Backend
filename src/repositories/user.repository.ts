import pool from "../config/db";
import { User } from "../models/user.model";

const ALLOWED_SECTIONS = new Set([
  "home",
  "menu",
  "miscellaneous",
  "blog",
  "news",
  "university",
]);

export class UserRepository {
  private parseSectionAccess(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .map((v) => String(v || "").trim().toLowerCase())
        .filter((v) => ALLOWED_SECTIONS.has(v));
    }
    if (typeof value === "string" && value.trim()) {
      try {
        return this.parseSectionAccess(JSON.parse(value));
      } catch {
        return value
          .split(",")
          .map((v) => v.trim().toLowerCase())
          .filter((v) => ALLOWED_SECTIONS.has(v));
      }
    }
    return [];
  }

  private serializeSectionAccess(value?: string[] | string | null): string | null {
    const parsed = this.parseSectionAccess(value ?? []);
    return JSON.stringify(parsed);
  }

  private normalizeUser(user: any): User | null {
    if (!user) return null;
    return {
      ...user,
      can_create: Boolean(user.can_create),
      can_read: Boolean(user.can_read),
      can_update: Boolean(user.can_update),
      can_delete: Boolean(user.can_delete),
      section_access: this.parseSectionAccess(user.section_access),
    };
  }

  async findById(id: number): Promise<User | null> {
    const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return this.normalizeUser(rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [rows]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    console.log([rows], "rows");
    return this.normalizeUser(rows[0]);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    role?: string
  ): Promise<{ data: User[]; total: number; pages: number }> {
    const offset = (page - 1) * limit;

    let countQuery = "SELECT COUNT(*) as total FROM users";
    let selectQuery =
      "SELECT id, name, email, role, can_create, can_read, can_update, can_delete, section_access, created_at, updated_at FROM users";
    const queryParams: any[] = [];

    if (role) {
      countQuery += " WHERE role = ?";
      selectQuery += " WHERE role = ?";
      queryParams.push(role);
    }

    selectQuery += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    const [countResult]: any = role
      ? await pool.query(countQuery, [role])
      : await pool.query(countQuery);
    const total = countResult[0]?.total || 0;
    const pages = Math.ceil(total / limit);

    const [rows]: any = await pool.query(selectQuery, queryParams);

    const data = rows
      .map((row: any) => this.normalizeUser(row))
      .filter((user: User | null) => user !== null) as User[];

    return { data, total, pages };
  }

  async delete(id: number): Promise<boolean> {
    const [result]: any = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  async create(user: {
    name: string;
    email: string;
    password: string;
    role?: string;
    can_create?: boolean | null;
    can_read?: boolean | null;
    can_update?: boolean | null;
    can_delete?: boolean | null;
    section_access?: string[] | string | null;
  }): Promise<User> {
    const [res]: any = await pool.query(
      `INSERT INTO users
        (name, email, password, role, can_create, can_read, can_update, can_delete, section_access, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        user.name,
        user.email,
        user.password,
        user.role || "mentor",
        user.can_create !== undefined ? (user.can_create ? 1 : 0) : 0,
        user.can_read !== undefined ? (user.can_read ? 1 : 0) : 1,
        user.can_update !== undefined ? (user.can_update ? 1 : 0) : 0,
        user.can_delete !== undefined ? (user.can_delete ? 1 : 0) : 0,
        this.serializeSectionAccess(user.section_access),
      ]
    );
    const [rows]: any = await pool.query("SELECT * FROM users WHERE id = ?", [res.insertId]);
    return this.normalizeUser(rows[0]) as User;
  }

  async update(
    id: number,
    user: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
      can_create?: boolean | null;
      can_read?: boolean | null;
      can_update?: boolean | null;
      can_delete?: boolean | null;
      section_access?: string[] | string | null;
    }
  ): Promise<User | null> {
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
    if (user.can_create !== undefined) {
      fields.push("can_create = ?");
      values.push(user.can_create ? 1 : 0);
    }
    if (user.can_read !== undefined) {
      fields.push("can_read = ?");
      values.push(user.can_read ? 1 : 0);
    }
    if (user.can_update !== undefined) {
      fields.push("can_update = ?");
      values.push(user.can_update ? 1 : 0);
    }
    if (user.can_delete !== undefined) {
      fields.push("can_delete = ?");
      values.push(user.can_delete ? 1 : 0);
    }
    if (user.section_access !== undefined) {
      fields.push("section_access = ?");
      values.push(this.serializeSectionAccess(user.section_access));
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
    return this.normalizeUser(rows[0]);
  }
}
export default new UserRepository();
