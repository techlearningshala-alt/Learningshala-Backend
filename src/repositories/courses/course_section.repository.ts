import type { Pool, PoolConnection } from "mysql2/promise";
import pool from "../../config/db";

export interface CourseSectionRecord {
  id: number;
  course_id: number;
  section_key: string;
  title: string;
  description?: string | null;
  image?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CourseSectionInput {
  section_key: string;
  title: string;
  description?: string | null;
  image?: string | null;
}

type Executor = Pool | PoolConnection;

class CourseSectionRepository {
  private getExecutor(conn?: Executor) {
    return conn || pool;
  }

  async findByCourseId(
    courseId: number,
    conn?: Executor
  ): Promise<CourseSectionRecord[]> {
    const executor = this.getExecutor(conn);
    const [rows]: any = await executor.query(
      `SELECT *
         FROM course_sections
        WHERE course_id = ?
        ORDER BY id ASC`,
      [courseId]
    );
    return rows;
  }

  async replaceForCourse(
    courseId: number,
    sections: CourseSectionInput[],
    conn?: Executor
  ): Promise<void> {
    const executor = this.getExecutor(conn);
    await executor.query(`DELETE FROM course_sections WHERE course_id = ?`, [
      courseId,
    ]);

    if (!sections || !sections.length) {
      return;
    }

    const values: any[] = [];
    const placeholders: string[] = [];

    sections.forEach((section) => {
      placeholders.push("(?, ?, ?, ?, ?)");
      values.push(
        courseId,
        section.section_key,
        section.title,
        section.description ?? null,
        section.image ?? null
      );
    });

    await executor.query(
      `INSERT INTO course_sections (course_id, section_key, title, description, image)
       VALUES ${placeholders.join(", ")}`,
      values
    );
  }
}

export default new CourseSectionRepository();

