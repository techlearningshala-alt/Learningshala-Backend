import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";

export interface SpecializationBannerRecord {
  id: number;
  specialization_id: number;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SpecializationBannerInput {
  id?: number;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
}

type Executor = Pool | PoolConnection;

class SpecializationBannerRepository {
  private getExecutor(conn?: Executor): Executor {
    return conn || pool;
  }

  async findBySpecializationId(
    specializationId: number,
    conn?: Executor
  ): Promise<SpecializationBannerRecord[]> {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query(
      `SELECT *
         FROM specialization_banners
        WHERE specialization_id = ?
        ORDER BY id ASC`,
      [specializationId]
    );
    return rows;
  }

  async replaceForSpecialization(
    specializationId: number,
    banners: SpecializationBannerInput[],
    conn?: Executor
  ): Promise<void> {
    const executor = this.getExecutor(conn);
    await executor.query(`DELETE FROM specialization_banners WHERE specialization_id = ?`, [
      specializationId,
    ]);

    if (!banners || !banners.length) {
      return;
    }

    const values: any[] = [];
    const placeholders: string[] = [];

    banners.forEach((banner) => {
      placeholders.push("(?, ?, ?, ?)");
      values.push(
        specializationId,
        banner.banner_image ?? null,
        banner.video_id ?? null,
        banner.video_title ?? null
      );
    });

    await executor.query(
      `INSERT INTO specialization_banners (specialization_id, banner_image, video_id, video_title)
       VALUES ${placeholders.join(", ")}`,
      values
    );
  }
}

export default new SpecializationBannerRepository();

