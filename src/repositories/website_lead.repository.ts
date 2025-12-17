import pool from "../config/db";
import { WebsiteLead } from "../models/website_lead.model";

export interface ListWebsiteLeadOptions {
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export const WebsiteLeadRepository = {
  async findAll(page = 1, limit = 10, options: ListWebsiteLeadOptions = {}) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [];

    if (options.search) {
      const like = `%${options.search}%`;
      where.push(
        "(name LIKE ? OR email LIKE ? OR phone LIKE ? OR course LIKE ? OR specialization LIKE ?)"
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
      `SELECT
        id,
        name,
        email,
        phone,
        course,
        specialization,
        state,
        city,
        lead_source,
        sub_source,
        utm_source,
        utm_campaign,
        utm_adgroup,
        utm_ads,
        website_url,
        created_at
      FROM website_leads
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total
       FROM website_leads
       ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;

    return {
      data: rows as WebsiteLead[],
      page,
      pages: limit ? Math.ceil(total / limit) : 1,
      total,
    };
  },

  async create(payload: WebsiteLead): Promise<WebsiteLead> {
    const sql = `
      INSERT INTO website_leads
      (
        name, email, phone, course, specialization, state, city,
        lead_source, sub_source, utm_source, utm_campaign, utm_adgroup, utm_ads,
        website_url, otp
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const params = [
      payload.name,
      payload.email ?? null,
      payload.phone ?? null,
      payload.course ?? null,
      payload.specialization ?? null,
      payload.state ?? null,
      payload.city ?? null,
      payload.lead_source ?? null,
      payload.sub_source ?? null,
      payload.utm_source ?? null,
      payload.utm_campaign ?? null,
      payload.utm_adgroup ?? null,
      payload.utm_ads ?? null,
      payload.website_url ?? null,
      payload.otp ?? "123456",
    ];

    const [result]: any = await pool.query(sql, params);

    return {
      id: result.insertId,
      ...payload,
    };
  },

  async verifyOtp(id: number, otp: string): Promise<boolean> {
    const sql = `SELECT id FROM website_leads WHERE id = ? AND otp = ?`;
    const [rows]: any = await pool.query(sql, [id, otp.trim()]);
    return rows.length > 0;
  },
};

