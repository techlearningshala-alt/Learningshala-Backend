import { UniversityTypesRepository } from "../../repositories/universities/university_types.repository";
import { UniversityType } from "../../models/universities/university_types.model";

const universityTypesRepo = new UniversityTypesRepository();

export class UniversityTypesService {
  static async list(page: number, limit: number) {
    return universityTypesRepo.findAll(page, limit);
  }

  static async get(id: number): Promise<UniversityType | null> {
    return universityTypesRepo.findById(id);
  }

  static async create(data: Omit<UniversityType, "id" | "created_at" | "updated_at">): Promise<UniversityType> {
    return universityTypesRepo.create(data);
  }

  static async update(
    id: number,
    data: Partial<UniversityType> & { saveWithDate?: boolean }
  ): Promise<boolean> {
    return universityTypesRepo.update(id, data);
  }

  static async delete(id: number): Promise<void> {
    return universityTypesRepo.delete(id);
  }
}

