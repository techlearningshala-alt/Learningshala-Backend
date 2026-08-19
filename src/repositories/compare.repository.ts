import pool from "../config/db";
import {
  CompareSet,
  ComparePair,
  CreateCompareSetDto,
  UpdateCompareSetDto,
} from "../models/compare.model";

export const CompareRepository = {
  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [rows]: any = await pool.query(
      `SELECT
         cs.id,
         cs.title,
         cs.created_at,
         cs.updated_at,
         COUNT(cp.id) AS pair_count
       FROM compare_sets cs
       LEFT JOIN compare_pairs cp ON cp.compare_set_id = cs.id
       GROUP BY cs.id, cs.title, cs.created_at, cs.updated_at
       ORDER BY cs.id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) AS total FROM compare_sets`
    );

    const data = await Promise.all(
      (rows as CompareSet[]).map(async (row) => {
        const pairs = await this.findPairsBySetId(Number(row.id));
        return {
          ...row,
          pairs,
          pair_count: pairs.length,
        };
      })
    );

    return {
      data,
      page,
      pages: Math.ceil((countRows[0]?.total || 0) / limit) || 1,
      total: countRows[0]?.total || 0,
    };
  },

  async findPairsBySetId(compareSetId: number): Promise<ComparePair[]> {
    const [rows]: any = await pool.query(
      `SELECT
         cp.id,
         cp.compare_set_id,
         cp.sort_order,
         cp.university_id,
         cp.university_course_id,
         cp.created_at,
         cp.updated_at,
         u.university_name,
         uc.name AS course_name
       FROM compare_pairs cp
       LEFT JOIN universities u ON u.id = cp.university_id
       LEFT JOIN university_courses uc ON uc.id = cp.university_course_id
       WHERE cp.compare_set_id = ?
       ORDER BY cp.sort_order ASC, cp.id ASC`,
      [compareSetId]
    );
    return rows as ComparePair[];
  },

  async findById(id: number): Promise<CompareSet | null> {
    const [rows]: any = await pool.query(
      `SELECT id, title, created_at, updated_at FROM compare_sets WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!rows.length) return null;
    const set = rows[0] as CompareSet;
    set.pairs = await this.findPairsBySetId(id);
    set.pair_count = set.pairs.length;
    return set;
  },

  async create(payload: CreateCompareSetDto): Promise<CompareSet> {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result]: any = await conn.query(
        `INSERT INTO compare_sets (title) VALUES (?)`,
        [payload.title?.trim() || null]
      );
      const compareSetId = result.insertId as number;

      for (let i = 0; i < payload.pairs.length; i += 1) {
        const pair = payload.pairs[i];
        await conn.query(
          `INSERT INTO compare_pairs
           (compare_set_id, sort_order, university_id, university_course_id)
           VALUES (?, ?, ?, ?)`,
          [compareSetId, i + 1, pair.university_id, pair.university_course_id]
        );
      }

      await conn.commit();
      return (await this.findById(compareSetId)) as CompareSet;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async update(id: number, payload: UpdateCompareSetDto): Promise<CompareSet | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(`UPDATE compare_sets SET title = ? WHERE id = ?`, [
        payload.title?.trim() || null,
        id,
      ]);

      await conn.query(`DELETE FROM compare_pairs WHERE compare_set_id = ?`, [id]);

      for (let i = 0; i < payload.pairs.length; i += 1) {
        const pair = payload.pairs[i];
        await conn.query(
          `INSERT INTO compare_pairs
           (compare_set_id, sort_order, university_id, university_course_id)
           VALUES (?, ?, ?, ?)`,
          [id, i + 1, pair.university_id, pair.university_course_id]
        );
      }

      await conn.commit();
      return await this.findById(id);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async remove(id: number): Promise<boolean> {
    const [result]: any = await pool.query(
      `DELETE FROM compare_sets WHERE id = ?`,
      [id]
    );
    return Boolean(result?.affectedRows);
  },
};
