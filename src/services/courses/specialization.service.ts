import SpecializationRepo from "../../repositories/courses/specialization.repository";
import { Specialization } from "../../models/courses/specializations.model";

const repo = new SpecializationRepo();

export const listSpecializations = (page = 1, limit = 10) => repo.findAll(page, limit);
export const getSpecialization = (id: number) => repo.findById(id);
export const addSpecialization = (item: Partial<Specialization>) => repo.create(item);
export const updateSpecialization = (id: number, item: Partial<Specialization>, saveWithDate = true) =>
  repo.update(id, item, saveWithDate);
export const deleteSpecialization = (id: number) => repo.delete(id);
