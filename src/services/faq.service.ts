import { FaqRepository } from "../repositories/faq.repository";
import { FaqCategory, Faq } from "../models/faq_category.model";

const faqRepo = new FaqRepository();

export class FaqService {
  // -------- Categories CRUD --------
  static async listCategories(page: number, limit: number) {
    return faqRepo.findAllCategories(page, limit);
  }

  static async getCategory(id: number): Promise<FaqCategory | null> {
    return faqRepo.findCategoryById(id);
  }

  static async createCategory(data: Omit<FaqCategory, "id" | "created_at" | "updated_at">): Promise<FaqCategory> {
    return faqRepo.createCategory(data);
  }

  static async updateCategory(
    id: number,
    data: Partial<FaqCategory> & { saveWithDate?: boolean }
  ): Promise<boolean> {
    return faqRepo.updateCategory(id, data);
  }


  static async deleteCategory(id: number): Promise<void> {
    return faqRepo.deleteCategory(id);
  }

  // -------- Questions CRUD --------

  static async listAdminQuestions(page: number, limit: number) { return faqRepo.findAdminQuestions(page, limit); }

  static async listAllQuestions() {
    const result = await faqRepo.findAllQuestions();
    const { data } = result;

    // Group by category heading
    const grouped = data.reduce((acc: any, row: any) => {
      const category = row.heading || "Uncategorized";
      const cat_id = row.slug || category.toLowerCase().replace(/\s+/g, "-");

      if (!acc[category]) {
        acc[category] = {
          category,
          cat_id,
          priority: row.category_priority ?? 999,
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

    // Convert to array and sort by priority
    const groupedArray = Object.values(grouped).sort((a: any, b: any) => {
      const priorityA = a.priority ?? 999;
      const priorityB = b.priority ?? 999;
      return priorityA - priorityB;
    });

    return {
      data: groupedArray
    };
  }




  static async listQuestions(categoryId: number): Promise<Faq[]> {
    return faqRepo.findQuestionsByCategory(categoryId);
  }

  static async getQuestion(id: number): Promise<Faq | null> {
    return faqRepo.findQuestionById(id);
  }

  static async createQuestion(data: Omit<Faq, "id" | "created_at" | "updated_at">): Promise<Faq> {
    return faqRepo.createQuestion(data);
  }

  static async updateQuestion(id: number, data: Partial<Faq>): Promise<boolean> {
    return faqRepo.updateQuestion(id, data);
  }

  static async deleteQuestion(id: number): Promise<void> {
    return faqRepo.deleteQuestion(id);
  }
}
