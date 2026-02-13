import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";
import { Redirection } from "../../models/redirections/redirection.model";

export default class RedirectionRepo {
  private getExecutor(conn?: Pool | PoolConnection) {
    return conn || pool;
  }

  private mapRow(row: any): Redirection {
    return {
      id: row.id,
      old_url: row.old_url,
      new_url: row.new_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async findAll(page = 1, limit = 20, search?: string, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const offset = (page - 1) * limit;

    let whereClause = "";
    const queryParams: any[] = [];

    if (search && search.trim()) {
      whereClause = "WHERE old_url LIKE ? OR new_url LIKE ?";
      const searchTerm = `%${search.trim()}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    const [rows]: any = await executor.query(
      `SELECT SQL_CALC_FOUND_ROWS * FROM redirections ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const [[{ "FOUND_ROWS()": total }]]: any = await executor.query("SELECT FOUND_ROWS()");

    return {
      data: rows.map((row: any) => this.mapRow(row)),
      page,
      pages: Math.ceil(total / limit),
      total,
    };
  }

  async findById(id: number, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query("SELECT * FROM redirections WHERE id = ?", [id]);
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async findByOldUrl(oldUrl: string, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query("SELECT * FROM redirections WHERE old_url = ?", [oldUrl]);
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async create(item: Partial<Redirection>, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [result]: any = await executor.query(
      `INSERT INTO redirections (old_url, new_url) VALUES (?, ?)`,
      [item.old_url, item.new_url]
    );
    return this.findById(result.insertId, conn);
  }

  async update(id: number, item: Partial<Redirection>, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const fields: string[] = [];
    const values: any[] = [];

    if (item.old_url !== undefined) {
      fields.push("old_url = ?");
      values.push(item.old_url);
    }
    if (item.new_url !== undefined) {
      fields.push("new_url = ?");
      values.push(item.new_url);
    }

    if (!fields.length) return null;

    fields.push("updated_at = NOW()");
    values.push(id);

    const [result]: any = await executor.query(
      `UPDATE redirections SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;

    return this.findById(id, conn);
  }

  async delete(id: number, conn?: Pool | PoolConnection) {
    const executor = this.getExecutor(conn);
    const [result]: any = await executor.query("DELETE FROM redirections WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}
