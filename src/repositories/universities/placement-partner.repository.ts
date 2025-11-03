// placement-partner.repository.ts
import pool from "../../config/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import {
  PlacementPartner,
  CreatePlacementPartnerDto,
  UpdatePlacementPartnerDto,
  PlacementPartnerWithUniversity,
} from "../../models/universities/placement-partner.model";

export const PlacementPartnerRepo = {
  /**
   * Create new placement partner
   */
  async createPlacementPartner(data: CreatePlacementPartnerDto): Promise<number> {
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO placement_partners (logo, name, created_at, updated_at) 
       VALUES (?, ?, NOW(), NOW())`,
      [
        data.logo || null,
        data.name || "",
      ]
    );
    return result.insertId;
  },

  /**
   * Get placement partner by ID
   */
  async getPlacementPartnerById(id: number): Promise<PlacementPartner | null> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM placement_partners WHERE id = ?`,
      [id]
    );
    return (rows[0] as PlacementPartner) || null;
  },

  /**
   * Get all placement partners (with pagination)
   */
  async getAllPlacementPartners(limit: number, offset: number): Promise<PlacementPartner[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM placement_partners 
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows as PlacementPartner[];
  },

  /**
   * Get total count of placement partners
   */
  async getTotalCount(): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM placement_partners`
    );
    return (rows[0] as any).count;
  },

  /**
   * Update placement partner
   */
  async updatePlacementPartner(id: number, data: UpdatePlacementPartnerDto): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE placement_partners 
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
   * Delete placement partner
   */
  async deletePlacementPartner(id: number): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      `DELETE FROM placement_partners WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Check if placement partner exists
   */
  async placementPartnerExists(id: number): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM placement_partners WHERE id = ?`,
      [id]
    );
    return (rows[0] as any).count > 0;
  },
};

