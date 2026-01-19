import blogFaqRepo from "../../repositories/blogs/blog_faq.repository";
import { BlogFaqCategory, BlogFaq } from "../../models/blogs/blog_faq.model";

export class BlogFaqService {
  // -------- Categories CRUD --------
  static async listCategories(page: number, limit: number) {
    return blogFaqRepo.findAllCategories(page, limit);
  }

  static async getCategory(id: number): Promise<BlogFaqCategory | null> {
    return blogFaqRepo.findCategoryById(id);
  }

  static async createCategory(data: Omit<BlogFaqCategory, "id" | "created_at" | "updated_at">): Promise<BlogFaqCategory> {
    return blogFaqRepo.createCategory(data);
  }

  static async updateCategory(
    id: number,
    data: Partial<BlogFaqCategory> & { saveWithDate?: boolean }
  ): Promise<boolean> {
    return blogFaqRepo.updateCategory(id, data);
  }

  static async deleteCategory(id: number): Promise<void> {
    return blogFaqRepo.deleteCategory(id);
  }

  // -------- Questions CRUD --------

  static async listAdminQuestions(page: number, limit: number, blogId?: number, categoryId?: number) {
    return blogFaqRepo.findAdminQuestions(page, limit, blogId, categoryId);
  }

  static async listAllQuestions() {
    const result = await blogFaqRepo.findAllQuestions();
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

  static async listQuestions(categoryId: number): Promise<BlogFaq[]> {
    return blogFaqRepo.findQuestionsByCategory(categoryId);
  }

  static async listQuestionsByBlogId(blogId: number): Promise<BlogFaq[]> {
    return blogFaqRepo.findQuestionsByBlogId(blogId);
  }

  static async getQuestion(id: number): Promise<BlogFaq | null> {
    return blogFaqRepo.findQuestionById(id);
  }

  static async createQuestion(data: Omit<BlogFaq, "id" | "created_at" | "updated_at">): Promise<BlogFaq> {
    return blogFaqRepo.createQuestion(data);
  }

  static async updateQuestion(id: number, data: Partial<BlogFaq>): Promise<boolean> {
    return blogFaqRepo.updateQuestion(id, data);
  }

  static async deleteQuestion(id: number): Promise<void> {
    return blogFaqRepo.deleteQuestion(id);
  }
}
