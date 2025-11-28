import courseFaqRepo from "../../repositories/courses/course_faq.repository";
import { CourseFaqCategory, CourseFaq } from "../../models/courses/course_faq.model";

export class CourseFaqService {
  // -------- Categories CRUD --------
  static async listCategories(page: number, limit: number) {
    return courseFaqRepo.findAllCategories(page, limit);
  }

  static async getCategory(id: number): Promise<CourseFaqCategory | null> {
    return courseFaqRepo.findCategoryById(id);
  }

  static async createCategory(data: Omit<CourseFaqCategory, "id" | "created_at" | "updated_at">): Promise<CourseFaqCategory> {
    return courseFaqRepo.createCategory(data);
  }

  static async updateCategory(
    id: number,
    data: Partial<CourseFaqCategory> & { saveWithDate?: boolean }
  ): Promise<boolean> {
    return courseFaqRepo.updateCategory(id, data);
  }

  static async deleteCategory(id: number): Promise<void> {
    return courseFaqRepo.deleteCategory(id);
  }

  // -------- Questions CRUD --------

  static async listAdminQuestions(page: number, limit: number, courseId?: number, categoryId?: number) {
    return courseFaqRepo.findAdminQuestions(page, limit, courseId, categoryId);
  }

  static async listAllQuestions() {
    const result = await courseFaqRepo.findAllQuestions();
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

  static async listQuestions(categoryId: number): Promise<CourseFaq[]> {
    return courseFaqRepo.findQuestionsByCategory(categoryId);
  }

  static async listQuestionsByCourseId(courseId: number): Promise<CourseFaq[]> {
    return courseFaqRepo.findQuestionsByCourseId(courseId);
  }

  static async getQuestion(id: number): Promise<CourseFaq | null> {
    return courseFaqRepo.findQuestionById(id);
  }

  static async createQuestion(data: Omit<CourseFaq, "id" | "created_at" | "updated_at">): Promise<CourseFaq> {
    return courseFaqRepo.createQuestion(data);
  }

  static async updateQuestion(id: number, data: Partial<CourseFaq>): Promise<boolean> {
    return courseFaqRepo.updateQuestion(id, data);
  }

  static async deleteQuestion(id: number): Promise<void> {
    return courseFaqRepo.deleteQuestion(id);
  }
}

