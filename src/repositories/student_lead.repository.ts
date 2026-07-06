import pool from "../config/db";
import { StudentLead } from "../models/student_lead.model";

export interface ListStudentLeadOptions {
  search?: string;
  fromDate?: string;
  toDate?: string;
}

const SELECT_COLUMNS = `
  id,
  name,
  qualification,
  specialization,
  goal,
  phone,
  experience,
  budget,
  email,
  chosen_programme,
  video_counselling_slot,
  preferred_callback_time,
  admission_expert_requested,
  created_at,
  updated_at
`;

function parseVideoSlot(raw: unknown) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

function mapRow(row: any): StudentLead {
  return {
    id: row.id,
    name: row.name,
    qualification: row.qualification,
    specialization: row.specialization,
    goal: row.goal,
    phone: row.phone,
    experience: row.experience,
    budget: row.budget,
    email: row.email,
    chosen_programme: row.chosen_programme,
    video_counselling_slot: parseVideoSlot(row.video_counselling_slot),
    preferred_callback_time: row.preferred_callback_time,
    admission_expert_requested: Boolean(row.admission_expert_requested),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const StudentLeadRepository = {
  async findAll(page = 1, limit = 10, options: ListStudentLeadOptions = {}) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [];

    if (options.search) {
      const like = `%${options.search}%`;
      where.push(
        "(name LIKE ? OR email LIKE ? OR phone LIKE ? OR qualification LIKE ? OR specialization LIKE ? OR chosen_programme LIKE ?)"
      );
      params.push(like, like, like, like, like, like);
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
      `SELECT ${SELECT_COLUMNS}
       FROM student_leads
       ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM student_leads ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;

    return {
      data: (rows as any[]).map(mapRow),
      page,
      pages: limit ? Math.ceil(total / limit) : 1,
      total,
    };
  },

  async findById(id: number): Promise<StudentLead | null> {
    const [rows]: any = await pool.query(
      `SELECT ${SELECT_COLUMNS} FROM student_leads WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows?.[0] ? mapRow(rows[0]) : null;
  },

  async create(payload: StudentLead): Promise<StudentLead> {
    const [result]: any = await pool.query(
      `INSERT INTO student_leads (
        name, qualification, specialization, goal, phone, experience, budget, email,
        chosen_programme, video_counselling_slot, preferred_callback_time,
        admission_expert_requested
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.name,
        payload.qualification ?? null,
        payload.specialization ?? null,
        payload.goal ?? null,
        payload.phone ?? null,
        payload.experience ?? null,
        payload.budget ?? null,
        payload.email ?? null,
        payload.chosen_programme ?? null,
        payload.video_counselling_slot ? JSON.stringify(payload.video_counselling_slot) : null,
        payload.preferred_callback_time ?? null,
        payload.admission_expert_requested ? 1 : 0,
      ]
    );

    const created = await this.findById(result.insertId);
    return created as StudentLead;
  },

  async update(id: number, payload: Partial<StudentLead>): Promise<StudentLead | null> {
    const fields: string[] = [];
    const params: any[] = [];

    const setField = (column: string, value: unknown) => {
      fields.push(`${column} = ?`);
      params.push(value);
    };

    if (payload.name !== undefined) setField("name", payload.name);
    if (payload.qualification !== undefined) setField("qualification", payload.qualification);
    if (payload.specialization !== undefined) setField("specialization", payload.specialization);
    if (payload.goal !== undefined) setField("goal", payload.goal);
    if (payload.phone !== undefined) setField("phone", payload.phone);
    if (payload.experience !== undefined) setField("experience", payload.experience);
    if (payload.budget !== undefined) setField("budget", payload.budget);
    if (payload.email !== undefined) setField("email", payload.email);
    if (payload.chosen_programme !== undefined) setField("chosen_programme", payload.chosen_programme);
    if (payload.video_counselling_slot !== undefined) {
      setField(
        "video_counselling_slot",
        payload.video_counselling_slot ? JSON.stringify(payload.video_counselling_slot) : null
      );
    }
    if (payload.preferred_callback_time !== undefined) {
      setField("preferred_callback_time", payload.preferred_callback_time);
    }
    if (payload.admission_expert_requested !== undefined) {
      setField("admission_expert_requested", payload.admission_expert_requested ? 1 : 0);
    }

    if (!fields.length) return this.findById(id);

    params.push(id);

    const [result]: any = await pool.query(
      `UPDATE student_leads SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`,
      params
    );

    if (!result?.affectedRows) return null;
    return this.findById(id);
  },
};
