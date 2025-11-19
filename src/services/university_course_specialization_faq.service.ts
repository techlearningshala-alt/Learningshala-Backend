import { UniversityCourseSpecializationFaqRepository } from "../repositories/university_course_specialization_faq.repository";
import { UniversityCourseSpecializationFaq } from "../models/university_course_specialization_faq.model";

const universityCourseSpecializationFaqRepo = new UniversityCourseSpecializationFaqRepository();

export class UniversityCourseSpecializationFaqService {
  // -------- Questions CRUD --------

  static async listAdminQuestions(page: number, limit: number, specializationId?: number, categoryId?: number) {
    return universityCourseSpecializationFaqRepo.findAdminQuestions(page, limit, specializationId, categoryId);
  }

  static async listAllQuestions() {
    const result = await universityCourseSpecializationFaqRepo.findAllQuestions();
    const { data } = result;

    // Group by category heading
    const grouped = data.reduce((acc: any, row: any) => {
      const category = row.heading || "Uncategorized";
      const cat_id = row.slug || category.toLowerCase().replace(/\s+/g, "-");

      if (!acc[category]) {
        acc[category] = {
          category,
          cat_id,
          items: []
        };
      }

      acc[category].items.push({
        id: row.id,
        question: row.title,
        answer: row.description
      });

      return acc;
    }, {});

    const groupedArray = Object.values(grouped);

    return {
      data: groupedArray
    };
  }

  static async listQuestions(categoryId: number): Promise<UniversityCourseSpecializationFaq[]> {
    return universityCourseSpecializationFaqRepo.findQuestionsByCategory(categoryId);
  }

  static async getQuestion(id: number): Promise<UniversityCourseSpecializationFaq | null> {
    return universityCourseSpecializationFaqRepo.findQuestionById(id);
  }

  static async createQuestion(data: Omit<UniversityCourseSpecializationFaq, "id" | "created_at" | "updated_at">): Promise<UniversityCourseSpecializationFaq> {
    return universityCourseSpecializationFaqRepo.createQuestion(data);
  }

  static async updateQuestion(id: number, data: Partial<UniversityCourseSpecializationFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    return universityCourseSpecializationFaqRepo.updateQuestion(id, data);
  }

  static async deleteQuestion(id: number): Promise<void> {
    return universityCourseSpecializationFaqRepo.deleteQuestion(id);
  }
}

