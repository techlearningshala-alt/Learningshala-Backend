import pool from "../config/db";
import { VagmineLead } from "../models/vagmine_lead.model";

export const VagmineLeadRepository = {
  async create(payload: VagmineLead): Promise<VagmineLead> {
    const [result]: any = await pool.query(
      `INSERT INTO vagmine_leads (name, email, \`number\`, message)
       VALUES (?, ?, ?, ?)`,
      [payload.name, payload.email, payload.number, payload.message]
    );

    return {
      id: result.insertId,
      ...payload,
    };
  },

  async findById(id: number): Promise<VagmineLead | null> {
    const [rows]: any = await pool.query(
      `SELECT id, name, email, \`number\`, message, created_at, updated_at
       FROM vagmine_leads
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },
};
