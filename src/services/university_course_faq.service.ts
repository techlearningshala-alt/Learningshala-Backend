import { UniversityCourseFaqRepository } from "../repositories/university_course_faq.repository";
import { UniversityCourseFaq } from "../models/university_course_faq.model";

const universityCourseFaqRepo = new UniversityCourseFaqRepository();

export class UniversityCourseFaqService {
  // -------- Questions CRUD --------

  static async listAdminQuestions(page: number, limit: number, courseId?: number, categoryId?: number) {
    return universityCourseFaqRepo.findAdminQuestions(page, limit, courseId, categoryId);
  }

  static async listAllQuestions() {
    const result = await universityCourseFaqRepo.findAllQuestions();
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

  static async listQuestions(categoryId: number): Promise<UniversityCourseFaq[]> {
    return universityCourseFaqRepo.findQuestionsByCategory(categoryId);
  }

  static async getQuestion(id: number): Promise<UniversityCourseFaq | null> {
    return universityCourseFaqRepo.findQuestionById(id);
  }

  static async createQuestion(data: Omit<UniversityCourseFaq, "id" | "created_at" | "updated_at">): Promise<UniversityCourseFaq> {
    return universityCourseFaqRepo.createQuestion(data);
  }

  static async updateQuestion(id: number, data: Partial<UniversityCourseFaq> & { saveWithDate?: boolean }): Promise<boolean> {
    return universityCourseFaqRepo.updateQuestion(id, data);
  }

  static async deleteQuestion(id: number): Promise<void> {
    return universityCourseFaqRepo.deleteQuestion(id);
  }
}

