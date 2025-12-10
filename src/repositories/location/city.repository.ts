import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";

type Executor = Pool | PoolConnection;

export class CityRepository {
  private getExecutor(conn?: Executor): Executor {
    return conn || pool;
  }

  async findByStateId(stateId: number, search?: string, conn?: Executor) {
    const executor = this.getExecutor(conn);
    const conditions: string[] = ["c.state_id = ?"];
    const values: any[] = [stateId];

    if (search && search.trim()) {
      conditions.push("c.name LIKE ?");
      values.push(`%${search.trim()}%`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const [rows]: any = await executor.query(
      `SELECT c.id, c.name 
       FROM cities c
       ${whereClause} 
       ORDER BY c.name ASC`,
      values
    );

    return rows;
  }
}

export default new CityRepository();
