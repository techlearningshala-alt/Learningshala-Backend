import pool from "../config/db";
import { PartnerWithUs } from "../models/partner_with_us.model";

export const PartnerWithUsRepository = {
  async create(payload: PartnerWithUs): Promise<PartnerWithUs> {
    const [result]: any = await pool.query(
      `INSERT INTO partner_with_us
        (institution_name, contact_person_name, email, phone, designation)
       VALUES (?, ?, ?, ?, ?)`,
      [
        payload.institution_name,
        payload.contact_person_name,
        payload.email,
        payload.phone,
        payload.designation,
      ]
    );

    return {
      id: result.insertId,
      ...payload,
    };
  },
};
