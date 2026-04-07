import newsFaqRepo from "../../repositories/news/news_faq.repository";
import { NewsFaq } from "../../models/news/news_faq.model";

export class NewsFaqService {
  static async listAdminQuestions(page: number, limit: number, newsId?: number) {
    return newsFaqRepo.findAdminQuestions(page, limit, newsId);
  }

  static async listAllQuestions() {
    const result = await newsFaqRepo.findAllQuestions();
    const { data } = result;

    return {
      data: data.map((row: any) => ({
        id: row.id,
        question: row.title,
        answer: row.description,
      })),
    };
  }

  static async listQuestionsByNewsId(newsId: number): Promise<NewsFaq[]> {
    return newsFaqRepo.findQuestionsByNewsId(newsId);
  }

  static async getQuestion(id: number): Promise<NewsFaq | null> {
    return newsFaqRepo.findQuestionById(id);
  }

  static async createQuestion(data: Omit<NewsFaq, "id" | "created_at" | "updated_at">): Promise<NewsFaq> {
    return newsFaqRepo.createQuestion(data);
  }

  static async updateQuestion(id: number, data: Partial<NewsFaq>): Promise<boolean> {
    return newsFaqRepo.updateQuestion(id, data);
  }

  static async deleteQuestion(id: number): Promise<void> {
    return newsFaqRepo.deleteQuestion(id);
  }
}
