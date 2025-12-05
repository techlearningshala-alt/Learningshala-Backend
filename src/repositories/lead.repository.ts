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

  async findByPhone(phone: string): Promise<Lead[]> {
    if (!phone) {
      return [];
    }
    // Normalize phone: remove all non-numeric characters for matching
    const normalizedPhone = phone.replace(/\D/g, '');
    
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
      WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', ''), '+', '') = ?
      ORDER BY created_on DESC, id DESC`,
      [normalizedPhone]
    );
    return rows as Lead[];
  }

  async findByPhoneOrEmail(phone?: string | null, email?: string | null) {
    if (!phone && !email) {
      return null;
    }

    const conditions: string[] = [];
    const params: any[] = [];

    if (phone) {
      conditions.push("phone = ?");
      params.push(phone);
    }

    if (email) {
      conditions.push("email = ?");
      params.push(email);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" OR ")}` : "";

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
      LIMIT 1`,
      params
    );

    return rows.length ? (rows[0] as Lead) : null;
  }

  async update(id: number, payload: Partial<CreateLeadDto>) {
    const fields: string[] = [];
    const values: any[] = [];

    // Build dynamic update query
    const updateableFields = [
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
      "website_url",
    ];

    updateableFields.forEach((field) => {
      if (payload[field as keyof CreateLeadDto] !== undefined) {
        fields.push(`${field} = ?`);
        values.push((payload as any)[field] ?? null);
      }
    });

    if (payload.created_on !== undefined) {
      fields.push("created_on = ?");
      values.push(payload.created_on ?? null);
    }

    if (fields.length === 0) {
      return null; // Nothing to update
    }

    values.push(id);

    const [result]: any = await pool.query(
      `UPDATE leads SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return null;
    }

    // Return updated lead
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
      [id]
    );

    return rows.length ? (rows[0] as Lead) : null;
  }
}

export default new LeadRepository();


