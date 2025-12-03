import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";

export interface SpecializationSectionRecord {
  id: number;
  specialization_id: number;
  section_key: string;
  title: string;
  description?: string | null;
  image?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SpecializationSectionInput {
  section_key: string;
  title: string;
  description?: string | null;
  image?: string | null;
}

type Executor = Pool | PoolConnection;

class SpecializationSectionRepository {
  private getExecutor(conn?: Executor) {
    return conn || pool;
  }

  async findBySpecializationId(
    specializationId: number,
    conn?: Executor
  ): Promise<SpecializationSectionRecord[]> {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query(
      `SELECT *
         FROM specialization_sections
        WHERE specialization_id = ?
        ORDER BY id ASC`,
      [specializationId]
    );
    return rows;
  }

  async replaceForSpecialization(
    specializationId: number,
    sections: SpecializationSectionInput[],
    conn?: Executor
  ): Promise<void> {
    const executor = this.getExecutor(conn);
    await executor.query(`DELETE FROM specialization_sections WHERE specialization_id = ?`, [
      specializationId,
    ]);

    if (!sections || !sections.length) {
      return;
    }

    const values: any[] = [];
    const placeholders: string[] = [];

    sections.forEach((section) => {
      placeholders.push("(?, ?, ?, ?, ?)");
      values.push(
        specializationId,
        section.section_key,
        section.title,
        section.description ?? null,
        section.image ?? null
      );
    });

    await executor.query(
      `INSERT INTO specialization_sections (specialization_id, section_key, title, description, image)
       VALUES ${placeholders.join(", ")}`,
      values
    );
  }
}

export default new SpecializationSectionRepository();

