import { CompareRepository } from "../repositories/compare.repository";
import {
  CreateCompareSetDto,
  UpdateCompareSetDto,
} from "../models/compare.model";
import { AppError } from "../middlewares/error.middleware";
import pool from "../config/db";

async function assertPairsValid(
  pairs: Array<{ university_id: number; university_course_id: number }>
) {
  for (const pair of pairs) {
    const [rows]: any = await pool.query(
      `SELECT id FROM university_courses
       WHERE id = ? AND university_id = ?
       LIMIT 1`,
      [pair.university_course_id, pair.university_id]
    );
    if (!rows.length) {
      throw new AppError(
        `Course ${pair.university_course_id} does not belong to university ${pair.university_id}`,
        400
      );
    }
  }
}

export async function listCompareSets(page = 1, limit = 10) {
  return CompareRepository.findAll(page, limit);
}

export async function getCompareSet(id: number) {
  const item = await CompareRepository.findById(id);
  if (!item) throw new AppError("Compare set not found", 404);
  return item;
}

export async function createCompareSet(payload: CreateCompareSetDto) {
  if (!payload.pairs || payload.pairs.length !== 2) {
    throw new AppError("Exactly 2 universities are required", 400);
  }
  await assertPairsValid(payload.pairs);
  return CompareRepository.create(payload);
}

export async function updateCompareSet(id: number, payload: UpdateCompareSetDto) {
  if (!payload.pairs || payload.pairs.length !== 2) {
    throw new AppError("Exactly 2 universities are required", 400);
  }
  await assertPairsValid(payload.pairs);
  const updated = await CompareRepository.update(id, payload);
  if (!updated) throw new AppError("Compare set not found", 404);
  return updated;
}

export async function deleteCompareSet(id: number) {
  const ok = await CompareRepository.remove(id);
  if (!ok) throw new AppError("Compare set not found", 404);
  return true;
}
