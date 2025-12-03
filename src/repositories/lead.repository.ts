import pool from "../config/db";
import { CreateLeadDto, Lead } from "../models/lead.model";

export interface ListLeadOptions {
  search?: string;
}

class LeadRepository {
  async findAll(page = 1, limit = 10, options: ListLeadOptions = {}) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [];

    if (options.search) {
      const like = `%${options.search}%`;
      where.push(
        "(name LIKE ? OR email LIKE ? OR phone LIKE ? OR course LIKE ? OR specialisation LIKE ?)"
      );
      params.push(like, like, like, like, like);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows]: any = await pool.query(
      `SELECT
        id,
        name,
        email,
        phone,
        course,
        specialisation,
        state,
        city,
        lead_source,
        sub_source,
        highest_qualification,
        preferred_budget,
        emi_required,
        salary,
        percentage,
        experience,
        currently_employed,
        university_for_placement_salaryhike_promotions,
        utm_source,
        utm_campaign,
        utm_adgroup,
        utm_ads,
        created_on,
        website_url
      FROM leads
      ${whereClause}
      ORDER BY created_on DESC, id DESC
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total
       FROM leads
       ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;

    return {
      data: rows as Lead[],
      page,
      pages: limit ? Math.ceil(total / limit) : 1,
      total,
    };
  }

  async create(payload: CreateLeadDto) {
    const columns = [
      "name",
      "email",
      "phone",
      "course",
      "specialisation",
      "state",
      "city",
      "lead_source",
      "sub_source",
      "highest_qualification",
      "preferred_budget",
      "emi_required",
      "salary",
      "percentage",
      "experience",
      "currently_employed",
      "university_for_placement_salaryhike_promotions",
      "utm_source",
      "utm_campaign",
      "utm_adgroup",
      "utm_ads",
      "created_on",
      "website_url",
    ];

    const values = columns.map((column) => (payload as any)[column] ?? null);

    const [result]: any = await pool.query(
      `INSERT INTO leads (${columns.join(", ")})
       VALUES (${columns.map(() => "?").join(", ")})`,
      values
    );

    const [rows]: any = await pool.query(
      `SELECT
        id,
        name,
        email,
        phone,
        course,
        specialisation,
        state,
        city,
        lead_source,
        sub_source,
        highest_qualification,
        preferred_budget,
        emi_required,
        salary,
        percentage,
        experience,
        currently_employed,
        university_for_placement_salaryhike_promotions,
        utm_source,
        utm_campaign,
        utm_adgroup,
        utm_ads,
        created_on,
        website_url
      FROM leads
      WHERE id = ?
      LIMIT 1`,
      [result.insertId]
    );

    return rows.length ? (rows[0] as Lead) : null;
  }
}

export default new LeadRepository();


