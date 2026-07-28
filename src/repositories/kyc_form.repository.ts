import pool from "../config/db";
import { KycForm } from "../models/kyc_form.model";

export interface ListKycFormOptions {
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export const KycFormRepository = {
  async create(payload: KycForm): Promise<KycForm> {
    const [result]: any = await pool.query(
      `INSERT INTO kyc_forms
        (
          full_name, dob, mobile, alt_mobile, email, pan, aadhaar, gender,
          shop_name, biz_type, address, locality, city, pincode, google_loc, footfall,
          acc_holder, bank_name, acc_number, ifsc, upi,
          doc_id, doc_pan, doc_shop_addr, doc_cheque, doc_photo_out, doc_photo_in,
          coi, coi_specify, declaration_agree
        )
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        payload.full_name,
        payload.dob ?? null,
        payload.mobile,
        payload.alt_mobile ?? null,
        payload.email,
        payload.pan ?? null,
        payload.aadhaar ?? null,
        payload.gender ?? null,
        payload.shop_name ?? null,
        payload.biz_type ?? null,
        payload.address ?? null,
        payload.locality ?? null,
        payload.city ?? null,
        payload.pincode ?? null,
        payload.google_loc ?? null,
        payload.footfall ?? null,
        payload.acc_holder ?? null,
        payload.bank_name ?? null,
        payload.acc_number ?? null,
        payload.ifsc ?? null,
        payload.upi ?? null,
        payload.doc_id ?? null,
        payload.doc_pan ?? null,
        payload.doc_shop_addr ?? null,
        payload.doc_cheque ?? null,
        payload.doc_photo_out ?? null,
        payload.doc_photo_in ?? null,
        payload.coi ?? null,
        payload.coi_specify ?? null,
        payload.declaration_agree ? 1 : 0,
      ]
    );

    return {
      id: result.insertId,
      ...payload,
      declaration_agree: Boolean(payload.declaration_agree),
    };
  },

  async findAll(page = 1, limit = 10, options: ListKycFormOptions = {}) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [];

    if (options.search) {
      const like = `%${options.search}%`;
      where.push(
        "(full_name LIKE ? OR email LIKE ? OR mobile LIKE ? OR shop_name LIKE ? OR pan LIKE ?)"
      );
      params.push(like, like, like, like, like);
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
      `SELECT * FROM kyc_forms
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM kyc_forms ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;

    return {
      data: (rows as KycForm[]).map((row) => ({
        ...row,
        declaration_agree: Boolean(row.declaration_agree),
      })),
      page,
      pages: limit ? Math.ceil(total / limit) : 1,
      total,
    };
  },

  async findById(id: number): Promise<KycForm | null> {
    const [rows]: any = await pool.query(`SELECT * FROM kyc_forms WHERE id = ?`, [id]);
    if (!rows?.[0]) return null;
    return {
      ...rows[0],
      declaration_agree: Boolean(rows[0].declaration_agree),
    };
  },
};
