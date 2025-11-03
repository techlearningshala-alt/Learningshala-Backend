import DomainRepo from "../../repositories/courses/domain.repository";
import { Domain } from "../../models/courses/domains.model";

const repo = new DomainRepo();

export default class DomainService {
  static async getAllDomains(page = 1, limit = 10, onlyVisible = false) {
    return repo.findAll(page, limit, onlyVisible);
  }

  static async getDomainById(id: number) {
    return repo.findById(id);
  }

  static async addDomain(data: Omit<Domain, "id" | "created_at" | "updated_at">) {
    return repo.create(data);
  }

  static async updateDomain(id: number, data: Partial<Domain>,saveWithDate: boolean) {
    console.log(saveWithDate,"service")
    return repo.update(id, data, saveWithDate);
  }

  static async deleteDomain(id: number) {
    return repo.delete(id);
  }
}