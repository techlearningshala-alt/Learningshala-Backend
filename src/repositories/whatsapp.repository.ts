import pool from "../config/db";
import {
  CreateWhatsAppUniversityDto,
  UpdateWhatsAppUniversityDto,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppUniversity,
} from "../models/whatsapp.model";

export const WhatsAppUniversityRepository = {
  async findAll(): Promise<WhatsAppUniversity[]> {
    const [rows]: any = await pool.query(
      `SELECT id, name, logo_url, phone_number_id, waba_id, display_number, created_at, updated_at
       FROM whatsapp_universities
       ORDER BY name ASC`
    );
    return rows as WhatsAppUniversity[];
  },

  async findById(id: number): Promise<WhatsAppUniversity | null> {
    const [rows]: any = await pool.query(
      `SELECT id, name, logo_url, phone_number_id, waba_id, display_number, created_at, updated_at
       FROM whatsapp_universities WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  /** Used by webhook: Meta includes phone_number_id on every inbound payload. */
  async findByPhoneNumberId(phoneNumberId: string): Promise<WhatsAppUniversity | null> {
    const [rows]: any = await pool.query(
      `SELECT id, name, logo_url, phone_number_id, waba_id, display_number, created_at, updated_at
       FROM whatsapp_universities WHERE phone_number_id = ? LIMIT 1`,
      [phoneNumberId]
    );
    return rows[0] || null;
  },

  async create(payload: CreateWhatsAppUniversityDto): Promise<WhatsAppUniversity> {
    const [result]: any = await pool.query(
      `INSERT INTO whatsapp_universities (name, logo_url, phone_number_id, waba_id, display_number)
       VALUES (?, ?, ?, ?, ?)`,
      [
        payload.name.trim(),
        payload.logo_url?.trim() || null,
        payload.phone_number_id.trim(),
        payload.waba_id.trim(),
        payload.display_number?.trim() || null,
      ]
    );
    return (await this.findById(result.insertId)) as WhatsAppUniversity;
  },

  async update(
    id: number,
    payload: UpdateWhatsAppUniversityDto
  ): Promise<WhatsAppUniversity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    await pool.query(
      `UPDATE whatsapp_universities
       SET name = ?, logo_url = ?, phone_number_id = ?, waba_id = ?, display_number = ?
       WHERE id = ?`,
      [
        payload.name?.trim() ?? existing.name,
        payload.logo_url !== undefined
          ? payload.logo_url?.trim() || null
          : existing.logo_url,
        payload.phone_number_id?.trim() ?? existing.phone_number_id,
        payload.waba_id?.trim() ?? existing.waba_id,
        payload.display_number !== undefined
          ? payload.display_number?.trim() || null
          : existing.display_number,
        id,
      ]
    );
    return this.findById(id);
  },
};

export const WhatsAppConversationRepository = {
  async findOrCreate(universityId: number, studentPhone: string): Promise<WhatsAppConversation> {
    const phone = String(studentPhone || "").replace(/\D/g, "");
    const [existing]: any = await pool.query(
      `SELECT * FROM whatsapp_conversations
       WHERE university_id = ? AND student_phone_number = ?
       LIMIT 1`,
      [universityId, phone]
    );
    if (existing[0]) return existing[0] as WhatsAppConversation;

    const [result]: any = await pool.query(
      `INSERT INTO whatsapp_conversations (university_id, student_phone_number, status, last_message_at)
       VALUES (?, ?, 'open', NOW())`,
      [universityId, phone]
    );
    const [rows]: any = await pool.query(
      `SELECT * FROM whatsapp_conversations WHERE id = ? LIMIT 1`,
      [result.insertId]
    );
    return rows[0] as WhatsAppConversation;
  },

  async findById(id: number): Promise<WhatsAppConversation | null> {
    const [rows]: any = await pool.query(
      `SELECT c.*,
              u.name AS university_name,
              u.logo_url AS university_logo_url,
              u.display_number,
              u.phone_number_id
       FROM whatsapp_conversations c
       INNER JOIN whatsapp_universities u ON u.id = c.university_id
       WHERE c.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async list(params: {
    universityId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: WhatsAppConversation[]; total: number; page: number; pages: number }> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const offset = (page - 1) * limit;
    const where: string[] = [];
    const sqlParams: any[] = [];

    if (params.universityId) {
      where.push("c.university_id = ?");
      sqlParams.push(params.universityId);
    }
    if (params.status) {
      where.push("c.status = ?");
      sqlParams.push(params.status);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) AS total
       FROM whatsapp_conversations c
       ${whereClause}`,
      sqlParams
    );
    const total = Number(countRows[0]?.total || 0);

    const [rows]: any = await pool.query(
      `SELECT
         c.*,
         u.name AS university_name,
         u.logo_url AS university_logo_url,
         u.display_number,
         (
           SELECT m.body
           FROM whatsapp_messages m
           WHERE m.conversation_id = c.id
           ORDER BY m.timestamp DESC, m.id DESC
           LIMIT 1
         ) AS last_message_preview
       FROM whatsapp_conversations c
       INNER JOIN whatsapp_universities u ON u.id = c.university_id
       ${whereClause}
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
       LIMIT ? OFFSET ?`,
      [...sqlParams, limit, offset]
    );

    return {
      data: rows as WhatsAppConversation[],
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    };
  },

  async touchLastMessage(conversationId: number, at?: Date): Promise<void> {
    await pool.query(
      `UPDATE whatsapp_conversations SET last_message_at = ?, status = 'open' WHERE id = ?`,
      [at || new Date(), conversationId]
    );
  },

  async updateStatus(id: number, status: "open" | "closed"): Promise<boolean> {
    const [result]: any = await pool.query(
      `UPDATE whatsapp_conversations SET status = ? WHERE id = ?`,
      [status, id]
    );
    return Boolean(result?.affectedRows);
  },
};

export const WhatsAppMessageRepository = {
  async create(params: {
    conversationId: number;
    direction: "inbound" | "outbound";
    body: string;
    waMessageId?: string | null;
    timestamp?: Date;
  }): Promise<WhatsAppMessage> {
    const ts = params.timestamp || new Date();
    try {
      const [result]: any = await pool.query(
        `INSERT INTO whatsapp_messages (conversation_id, direction, body, wa_message_id, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
        [
          params.conversationId,
          params.direction,
          params.body,
          params.waMessageId || null,
          ts,
        ]
      );
      await WhatsAppConversationRepository.touchLastMessage(params.conversationId, ts);
      const [rows]: any = await pool.query(
        `SELECT * FROM whatsapp_messages WHERE id = ? LIMIT 1`,
        [result.insertId]
      );
      return rows[0] as WhatsAppMessage;
    } catch (err: any) {
      // Duplicate wa_message_id (Meta retries) — return existing
      if (err?.code === "ER_DUP_ENTRY" && params.waMessageId) {
        const [rows]: any = await pool.query(
          `SELECT * FROM whatsapp_messages WHERE wa_message_id = ? LIMIT 1`,
          [params.waMessageId]
        );
        if (rows[0]) return rows[0] as WhatsAppMessage;
      }
      throw err;
    }
  },

  async listByConversation(conversationId: number): Promise<WhatsAppMessage[]> {
    const [rows]: any = await pool.query(
      `SELECT * FROM whatsapp_messages
       WHERE conversation_id = ?
       ORDER BY timestamp ASC, id ASC`,
      [conversationId]
    );
    return rows as WhatsAppMessage[];
  },
};
