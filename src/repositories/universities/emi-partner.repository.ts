import pool from "../../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  EmiPartner,
  CreateEmiPartnerDto,
  UpdateEmiPartnerDto,
} from "../../models/universities/emi-partner.model";

export const EmiPartnerRepo = {
  /**
   * Create new EMI partner
   */
  async createEmiPartner(data: CreateEmiPartnerDto): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO emi_partners (logo, name, created_at, updated_at) 
       VALUES (?, ?, NOW(), NOW())`,
      [
        data.logo || null,
        data.name || "",
      ]
    );
    return result.insertId;
  },

  /**
   * Get EMI partner by ID
   */
  async getEmiPartnerById(id: number): Promise<EmiPartner | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM emi_partners WHERE id = ?`,
      [id]
    );
    return (rows[0] as EmiPartner) || null;
  },

  /**
   * Get all EMI partners (with pagination)
   */
  async getAllEmiPartners(limit: number, offset: number): Promise<EmiPartner[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM emi_partners 
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows as EmiPartner[];
  },

  /**
   * Get total count of EMI partners
   */
  async getTotalCount(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM emi_partners`
    );
    return (rows[0] as any).count;
  },

  /**
   * Update EMI partner
   */
  async updateEmiPartner(id: number, data: UpdateEmiPartnerDto): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE emi_partners 
       SET logo = ?, name = ?, updated_at = NOW() 
       WHERE id = ?`,
      [
        data.logo,
        data.name,
        id,
      ]
    );
    return result.affectedRows > 0;
  },

  /**
   * Delete EMI partner
   */
  async deleteEmiPartner(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM emi_partners WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Check if EMI partner exists
   */
  async emiPartnerExists(id: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM emi_partners WHERE id = ?`,
      [id]
    );
    return (rows[0] as any).count > 0;
  },
};

