import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";

export interface CourseBannerRecord {
  id: number;
  course_id: number;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CourseBannerInput {
  id?: number;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
}

type Executor = Pool | PoolConnection;

class CourseBannerRepository {
  private getExecutor(conn?: Executor): Executor {
    return conn || pool;
  }

  async findByCourseId(
    courseId: number,
    conn?: Executor
  ): Promise<CourseBannerRecord[]> {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query(
      `SELECT *
         FROM course_banners
        WHERE course_id = ?
        ORDER BY id ASC`,
      [courseId]
    );
    return rows;
  }

  async replaceForCourse(
    courseId: number,
    banners: CourseBannerInput[],
    conn?: Executor
  ): Promise<void> {
    const executor = this.getExecutor(conn);
    await executor.query(`DELETE FROM course_banners WHERE course_id = ?`, [
      courseId,
    ]);

    if (!banners || !banners.length) {
      return;
    }

    const values: any[] = [];
    const placeholders: string[] = [];

    banners.forEach((banner) => {
      placeholders.push("(?, ?, ?, ?)");
      values.push(
        courseId,
        banner.banner_image ?? null,
        banner.video_id ?? null,
        banner.video_title ?? null
      );
    });

    await executor.query(
      `INSERT INTO course_banners (course_id, banner_image, video_id, video_title)
       VALUES ${placeholders.join(", ")}`,
      values
    );
  }
}

export default new CourseBannerRepository();

