import pool from "../config/db";
import { JoinWaitlist } from "../models/join_waitlist.model";

export const JoinWaitlistRepository = {
  async create(payload: JoinWaitlist): Promise<JoinWaitlist> {
    const [result]: any = await pool.query(
      `INSERT INTO join_waitlist
        (full_name, email, phone, certification_program)
       VALUES (?, ?, ?, ?)`,
      [
        payload.full_name,
        payload.email,
        payload.phone,
        payload.certification_program,
      ]
    );

    return {
      id: result.insertId,
      ...payload,
    };
  },
};
