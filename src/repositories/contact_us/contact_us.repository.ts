import pool from "../../config/db";
import { ContactUs } from "../../models/contact_us/contact_us.model";

export interface ListContactUsOptions {
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export const ContactUsRepository = {
  async findAll(page = 1, limit = 10, options: ListContactUsOptions = {}) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [];

    if (options.search) {
      const like = `%${options.search}%`;
      where.push(
        "(name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?)"
      );
      params.push(like, like, like, like);
    }

    if (options.fromDate) {
      where.push("DATE(created_at) >= ?");
      params.push(options.fromDate);
    }

    if (options.toDate) {
      where.push("DATE(created_at) <= ?");
      params.push(options.toDate);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows]: any = await pool.query(
      `SELECT
        id,
        name,
        email,
        phone,
        message,
        created_at,
        updated_at
      FROM contact_us
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total
       FROM contact_us
       ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;

    return {
      data: rows as ContactUs[],
      page,
      pages: limit ? Math.ceil(total / limit) : 1,
      total,
    };
  },

  async create(payload: ContactUs): Promise<ContactUs> {
    const sql = `
      INSERT INTO contact_us
      (name, email, phone, message)
      VALUES (?, ?, ?, ?)
    `;

    const params = [
      payload.name,
      payload.email,
      payload.phone,
      payload.message,
    ];

    const [result]: any = await pool.query(sql, params);

    return {
      id: result.insertId,
      ...payload,
    };
  },

  async findById(id: number): Promise<ContactUs | null> {
    const [rows]: any = await pool.query(
      `SELECT id, name, email, phone, message, created_at, updated_at
       FROM contact_us
       WHERE id = ?`,
      [id]
    );

    return rows.length > 0 ? (rows[0] as ContactUs) : null;
  },

  async delete(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM contact_us WHERE id = ?`,
      [id]
    );

    return result.affectedRows > 0;
  },
};

