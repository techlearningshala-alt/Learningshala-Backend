import pool from "../config/db";
import { WebsiteLead } from "../models/website_lead.model";

export interface ListWebsiteLeadOptions {
  search?: string;
  fromDate?: string;
  toDate?: string;
  trafficType?: string;
  /** When set to b2b_free_counselling, return only those leads; otherwise hide them */
  filterLead?: string;
}

const COUNSELLING_FILTER_LEAD = "b2b_free_counselling";

const LEAD_SELECT_COLUMNS = `
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
  click_source,
  lead_url,
  traffic_type,
  interested_university,
  questions,
  university,
  preferred_time,
  preferred_date,
  budget,
  message,
  filter_lead,
  resume,
  report,
  created_at,
  updated_at
`;

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

    if (options.trafficType === "organic") {
      // Include legacy "referral" rows under organic (referral filter removed)
      where.push("(traffic_type = 'organic' OR traffic_type = 'referral' OR traffic_type IS NULL OR traffic_type = '')");
    } else if (options.trafficType) {
      where.push("traffic_type = ?");
      params.push(options.trafficType);
    }

    if (options.filterLead === COUNSELLING_FILTER_LEAD) {
      // B2B Leads tab: only counselling leads
      where.push("filter_lead = ?");
      params.push(COUNSELLING_FILTER_LEAD);
    } else {
      // Default Website Leads list: hide counselling leads
      where.push(
        "(filter_lead IS NULL OR filter_lead = '' OR filter_lead <> ?)"
      );
      params.push(COUNSELLING_FILTER_LEAD);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows]: any = await pool.query(
      `SELECT ${LEAD_SELECT_COLUMNS}
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

  async findById(id: number): Promise<WebsiteLead | null> {
    const [rows]: any = await pool.query(
      `SELECT ${LEAD_SELECT_COLUMNS}
       FROM website_leads
       WHERE id = ?`,
      [id]
    );
    return rows?.[0] || null;
  },

  async create(payload: WebsiteLead): Promise<WebsiteLead> {
    const sql = `
      INSERT INTO website_leads
      (
        name, email, phone, course, specialization, state, city,
        lead_source, sub_source, utm_source, utm_campaign, utm_adgroup, utm_ads,
        website_url, otp, click_source, lead_url, traffic_type, interested_university, questions, university,
        preferred_time, preferred_date, budget, message, filter_lead, resume, report
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    const budgetValue =
      payload.budget === undefined || payload.budget === null
        ? null
        : String(payload.budget).trim() || null;

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
      payload.click_source ?? null,
      payload.lead_url ?? null,
      payload.traffic_type ?? "organic",
      payload.interested_university ?? null,
      payload.questions ?? null,
      payload.university ?? null,
      payload.preferred_time ?? null,
      payload.preferred_date ?? null,
      budgetValue,
      payload.message ?? null,
      payload.filter_lead ?? null,
      payload.resume ?? null,
      payload.report ?? null,
    ];

    const [result]: any = await pool.query(sql, params);

    return {
      id: result.insertId,
      ...payload,
      budget: budgetValue,
    };
  },

  async updateById(
    id: number,
    payload: Partial<WebsiteLead>
  ): Promise<WebsiteLead | null> {
    const fields: string[] = [];
    const params: any[] = [];

    const setIfPresent = (column: string, value: unknown) => {
      if (value !== undefined) {
        fields.push(`${column} = ?`);
        params.push(value);
      }
    };

    setIfPresent("name", payload.name);
    setIfPresent("email", payload.email);
    setIfPresent("phone", payload.phone);
    setIfPresent("course", payload.course);
    setIfPresent("specialization", payload.specialization);
    setIfPresent("state", payload.state);
    setIfPresent("city", payload.city);
    setIfPresent("lead_source", payload.lead_source);
    setIfPresent("sub_source", payload.sub_source);
    setIfPresent("utm_source", payload.utm_source);
    setIfPresent("utm_campaign", payload.utm_campaign);
    setIfPresent("utm_adgroup", payload.utm_adgroup);
    setIfPresent("utm_ads", payload.utm_ads);
    setIfPresent("website_url", payload.website_url);
    setIfPresent("otp", payload.otp);
    setIfPresent("click_source", payload.click_source);
    setIfPresent("lead_url", payload.lead_url);
    setIfPresent("traffic_type", payload.traffic_type);
    setIfPresent("interested_university", payload.interested_university);
    setIfPresent("questions", payload.questions);
    setIfPresent("university", payload.university);
    setIfPresent("preferred_time", payload.preferred_time);
    setIfPresent("preferred_date", payload.preferred_date);
    if (payload.budget !== undefined) {
      const budgetValue =
        payload.budget === null ? null : String(payload.budget).trim() || null;
      fields.push("budget = ?");
      params.push(budgetValue);
    }
    setIfPresent("message", payload.message);
    setIfPresent("filter_lead", payload.filter_lead);
    setIfPresent("resume", payload.resume);
    setIfPresent("report", payload.report);

    if (!fields.length) {
      return this.findById(id);
    }

    fields.push("updated_at = NOW()");
    params.push(id);

    const [result]: any = await pool.query(
      `UPDATE website_leads SET ${fields.join(", ")} WHERE id = ?`,
      params
    );

    if (!result?.affectedRows) return null;
    return this.findById(id);
  },

  async verifyOtp(id: number, otp: string): Promise<boolean> {
    const sql = `SELECT id FROM website_leads WHERE id = ? AND otp = ?`;
    const [rows]: any = await pool.query(sql, [id, otp.trim()]);
    return rows.length > 0;
  },

  async updateInterestedUniversity(
    id: number,
    interestedUniversity: string | null = null
  ): Promise<WebsiteLead | null> {
    const [result]: any = await pool.query(
      `UPDATE website_leads
       SET interested_university = ?, updated_at = NOW()
       WHERE id = ?`,
      [interestedUniversity, id]
    );

    if (!result?.affectedRows) return null;
    return this.findById(id);
  },
};
