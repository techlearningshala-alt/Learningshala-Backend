import specializationFaqRepo from "../../repositories/courses/specialization_faq.repository";
import { SpecializationFaq } from "../../models/courses/specialization_faq.model";

export class SpecializationFaqService {
  static async listQuestionsBySpecializationId(specializationId: number): Promise<SpecializationFaq[]> {
    return specializationFaqRepo.findQuestionsBySpecializationId(specializationId);
  }

  static async getQuestion(id: number): Promise<SpecializationFaq | null> {
    return specializationFaqRepo.findQuestionById(id);
  }

  static async createQuestion(data: Omit<SpecializationFaq, "id" | "created_at" | "updated_at">): Promise<SpecializationFaq> {
    return specializationFaqRepo.createQuestion(data);
  }

  static async updateQuestion(id: number, data: Partial<SpecializationFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    return specializationFaqRepo.updateQuestion(id, data);
  }

  static async deleteQuestion(id: number): Promise<void> {
    return specializationFaqRepo.deleteQuestion(id);
  }
}

