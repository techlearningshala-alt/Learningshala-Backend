import pool from "../../config/db";
import {
  CreateFeeTypeDto,
  FeeType,
  UpdateFeeTypeDto,
} from "../../models/universities/fee_type.model";

export interface ListFeeTypeOptions {
  search?: string;
}

class FeeTypeRepository {
  async findAll(page = 1, limit = 10, options: ListFeeTypeOptions = {}) {
    const offset = (page - 1) * limit;
    const params: any[] = [];
    const where: string[] = [];

    if (options.search) {
      where.push("title LIKE ?");
      params.push(`%${options.search}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows]: any = await pool.query(
      `SELECT id, title, fee_key, created_at, updated_at
         FROM fee_types
         ${whereClause}
         ORDER BY created_at ASC, id ASC
         LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total
         FROM fee_types
         ${whereClause}`,
      params
    );

    const total = countRows[0]?.total ?? 0;

    return {
      data: rows as FeeType[],
      page,
      pages: limit ? Math.ceil(total / limit) : 1,
      total,
    };
  }

  async findById(id: number) {
    const [rows]: any = await pool.query(
      `SELECT id, title, fee_key, created_at, updated_at
         FROM fee_types
        WHERE id = ?
        LIMIT 1`,
      [id]
    );
    return rows.length ? (rows[0] as FeeType) : null;
  }

  async findAllRaw() {
    const [rows]: any = await pool.query(
      `SELECT id, title, fee_key, created_at, updated_at
         FROM fee_types
         ORDER BY title ASC`
    );
    return rows as FeeType[];
  }

  async create(payload: CreateFeeTypeDto) {
    const [result]: any = await pool.query(
      `INSERT INTO fee_types (title, fee_key)
       VALUES (?, ?)`,
      [payload.title, payload.fee_key]
    );

    return this.findById(result.insertId);
  }

  async update(id: number, payload: UpdateFeeTypeDto) {
    const fields: string[] = [];
    const values: any[] = [];

    if (payload.title !== undefined) {
      fields.push("title = ?");
      values.push(payload.title);
    }

    if (!fields.length) {
      return this.findById(id);
    }

    fields.push("updated_at = NOW()");
    values.push(id);

    await pool.query(
      `UPDATE fee_types
          SET ${fields.join(", ")}
        WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  async delete(id: number) {
    const [result]: any = await pool.query(
      `DELETE FROM fee_types WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }
}

export default new FeeTypeRepository();


