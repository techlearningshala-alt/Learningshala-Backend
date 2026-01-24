import blogFaqRepo from "../../repositories/blogs/blog_faq.repository";
import { BlogFaq } from "../../models/blogs/blog_faq.model";

export class BlogFaqService {
  // -------- Questions CRUD --------

  static async listAdminQuestions(page: number, limit: number, blogId?: number) {
    return blogFaqRepo.findAdminQuestions(page, limit, blogId);
  }

  static async listAllQuestions() {
    const result = await blogFaqRepo.findAllQuestions();
    const { data } = result;

    // Return simple array of FAQs without grouping
    return {
      data: data.map((row: any) => ({
        id: row.id,
        question: row.title,
        answer: row.description
      }))
    };
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
