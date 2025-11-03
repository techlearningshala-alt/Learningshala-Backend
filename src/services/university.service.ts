import { UniversityRepository } from "../repositories/university.repository";
import { AppError } from "../middlewares/error.middleware";

const repo = new UniversityRepository();

export const listUniversities = async (page: number, limit: number) => await repo.findAll();

export const getUniversity = async (id: number) => {
  const uni = await repo.findById(id);
  if (!uni) throw new AppError("University not found", 404);
  return uni;
};

export const addUniversity = async (name: string, university_logo: string) => {
  await repo.create({ name, university_logo });
  return { message: "University created successfully" };
};

export const updateUniversity = async (id: number, validated: { name?: string | undefined; university_logo?: string | undefined; }, saveDateFlag: boolean, name?: string, university_logo?: string) => {
  const uni = await repo.findById(id);
  if (!uni) throw new AppError("University not found", 404);
  await repo.update(id, { name, university_logo });
  return { message: "University updated successfully" };
};

export const deleteUniversity = async (id: number) => {
  const uni = await repo.findById(id);
  if (!uni) throw new AppError("University not found", 404);
  await repo.delete(id);
  return { message: "University deleted successfully" };
};
