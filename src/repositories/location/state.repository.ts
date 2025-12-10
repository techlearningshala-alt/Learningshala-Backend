import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";

type Executor = Pool | PoolConnection;

export class StateRepository {
  private getExecutor(conn?: Executor): Executor {
    return conn || pool;
  }

  async findAll(search?: string, conn?: Executor) {
    const executor = this.getExecutor(conn);
    const conditions: string[] = [];
    const values: any[] = [];

    if (search && search.trim()) {
      conditions.push("name LIKE ?");
      values.push(`%${search.trim()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [rows]: any = await executor.query(
      `SELECT id, name FROM states ${whereClause} ORDER BY name ASC`,
      values
    );

    return rows;
  }
}

export default new StateRepository();
