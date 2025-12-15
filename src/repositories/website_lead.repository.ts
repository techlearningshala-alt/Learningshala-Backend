import pool from "../config/db";
import { WebsiteLead } from "../models/website_lead.model";

export const WebsiteLeadRepository = {
  async create(payload: WebsiteLead): Promise<WebsiteLead> {
    const sql = `
      INSERT INTO website_leads
      (
        name, email, phone, course, specialization, state, city,
        lead_source, sub_source, utm_source, utm_campaign, utm_adgroup, utm_ads,
        website_url
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
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
    ];

    const [result]: any = await pool.query(sql, params);

    return {
      id: result.insertId,
      ...payload,
    };
  },
};

