import { UniversityFaqRepository } from "../../repositories/universities/university_faq.repository";
import { UniversityFaqCategory, UniversityFaq } from "../../models/universities/university_faq.model";

const universityFaqRepo = new UniversityFaqRepository();

export class UniversityFaqService {
  // -------- Categories CRUD --------
  static async listCategories(page: number, limit: number) {
    return universityFaqRepo.findAllCategories(page, limit);
  }

  static async getCategory(id: number): Promise<UniversityFaqCategory | null> {
    return universityFaqRepo.findCategoryById(id);
  }

  static async createCategory(data: Omit<UniversityFaqCategory, "id" | "created_at" | "updated_at">): Promise<UniversityFaqCategory> {
    return universityFaqRepo.createCategory(data);
  }

  static async updateCategory(
    id: number,
    data: Partial<UniversityFaqCategory> & { saveWithDate?: boolean }
  ): Promise<boolean> {
    return universityFaqRepo.updateCategory(id, data);
  }

  static async deleteCategory(id: number): Promise<void> {
    return universityFaqRepo.deleteCategory(id);
  }

  // -------- Questions CRUD --------

  static async listAdminQuestions(page: number, limit: number, universityId?: number, categoryId?: number) {
    return universityFaqRepo.findAdminQuestions(page, limit, universityId, categoryId);
  }

  static async listAllQuestions() {
    const result = await universityFaqRepo.findAllQuestions();
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

  static async listQuestions(categoryId: number): Promise<UniversityFaq[]> {
    return universityFaqRepo.findQuestionsByCategory(categoryId);
  }

  static async getQuestion(id: number): Promise<UniversityFaq | null> {
    return universityFaqRepo.findQuestionById(id);
  }

  static async createQuestion(data: Omit<UniversityFaq, "id" | "created_at" | "updated_at">): Promise<UniversityFaq> {
    return universityFaqRepo.createQuestion(data);
  }

  static async updateQuestion(id: number, data: Partial<UniversityFaq>): Promise<boolean> {
    return universityFaqRepo.updateQuestion(id, data);
  }

  static async deleteQuestion(id: number): Promise<void> {
    return universityFaqRepo.deleteQuestion(id);
  }
}

