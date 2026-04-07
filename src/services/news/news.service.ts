import { NewsRepository } from "../../repositories/news/news.repository";
import { News } from "../../models/news/news.model";

const newsRepo = new NewsRepository();

export class NewsService {
  static async list(page: number, limit: number, options: { search?: string; category_id?: number } = {}) {
    return newsRepo.findAll(page, limit, options);
  }

  static async listByCategorySlug(page: number, limit: number, categorySlug: string, options: { search?: string } = {}) {
    return newsRepo.findAllByCategorySlug(page, limit, categorySlug, options);
  }

  static async get(slug: string): Promise<News | null> {
    return newsRepo.findBySlug(slug);
  }

  static async getById(id: number): Promise<News | null> {
    return newsRepo.findById(id);
  }

  static async create(data: {
    category_id: number;
    h1_tag?: string | null;
    slug?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    author_id?: number | null;
    title: string;
    short_description?: string | null;
    author_name?: string | null;
    author_details?: string | null;
    author_image?: string | null;
    thumbnail?: string | null;
    verified?: boolean;
    update_date?: string | null;
    content?: string | null;
  }): Promise<News> {
    if (!data.category_id) {
      throw new Error("Category is required");
    }

    let updateDate: Date | null = null;
    if (data.update_date) {
      updateDate = new Date(data.update_date);
      if (isNaN(updateDate.getTime())) {
        throw new Error("Invalid update date format");
      }
    } else {
      updateDate = new Date();
    }

    return newsRepo.create({
      category_id: data.category_id,
      h1_tag: data.h1_tag ?? null,
      slug: data.slug ?? null,
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
      author_id: data.author_id ?? null,
      title: data.title,
      short_description: data.short_description ?? null,
      author_name: data.author_name ?? null,
      author_details: data.author_details ?? null,
      author_image: data.author_image ?? null,
      thumbnail: data.thumbnail ?? null,
      verified: data.verified ?? false,
      update_date: updateDate,
      content: data.content ?? null,
    });
  }

  static async update(
    id: number,
    data: Partial<{
      category_id: number;
      h1_tag: string | null;
      slug: string | null;
      meta_title: string | null;
      meta_description: string | null;
      author_id: number | null;
      title: string;
      short_description: string | null;
      author_name: string | null;
      author_details: string | null;
      author_image: string | null;
      thumbnail: string | null;
      verified: boolean;
      update_date: string | null;
      content: string | null;
    }> & { saveWithDate?: boolean | string }
  ): Promise<boolean> {
    const updateData: any = { ...data };

    let saveWithDate = true;
    if (data.saveWithDate !== undefined) {
      if (typeof data.saveWithDate === "string") {
        saveWithDate = data.saveWithDate === "true" || data.saveWithDate === "1";
      } else {
        saveWithDate = Boolean(data.saveWithDate);
      }
    }

    if (saveWithDate) {
      updateData.update_date = new Date();
    } else if (data.update_date !== undefined) {
      if (data.update_date) {
        const updateDate = new Date(data.update_date);
        if (isNaN(updateDate.getTime())) {
          throw new Error("Invalid update date format");
        }
        updateData.update_date = updateDate;
      } else {
        updateData.update_date = null;
      }
    }

    updateData.saveWithDate = saveWithDate;

    return newsRepo.update(id, updateData);
  }

  static async delete(id: number): Promise<void> {
    return newsRepo.delete(id);
  }

  static async toggleVerified(id: number, verified: boolean): Promise<News | null> {
    const updated = await newsRepo.update(id, { verified });
    if (!updated) return null;
    return newsRepo.findById(id);
  }
}
