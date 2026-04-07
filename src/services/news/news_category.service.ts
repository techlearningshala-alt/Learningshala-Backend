import slugify from "slugify";
import { NewsCategoryRepository } from "../../repositories/news/news_category.repository";
import { NewsCategory } from "../../models/news/news_category.model";

const newsCategoryRepo = new NewsCategoryRepository();

export class NewsCategoryService {
  static async list(page: number, limit: number) {
    return newsCategoryRepo.findAll(page, limit);
  }

  static async get(id: number): Promise<NewsCategory | null> {
    return newsCategoryRepo.findById(id);
  }

  static async getBySlug(slug: string): Promise<NewsCategory | null> {
    return newsCategoryRepo.findBySlug(slug);
  }

  static async create(data: {
    title: string;
    category_slug?: string;
    category_visibility?: string;
    category_summary?: string;
    meta_title?: string;
    meta_description?: string;
  }): Promise<NewsCategory> {
    const category_slug = data.category_slug || slugify(data.title, { lower: true, strict: true });

    const existing = await newsCategoryRepo.findBySlug(category_slug);
    if (existing) {
      throw new Error("Category slug already exists");
    }

    const visibilityBool = data.category_visibility === "yes" ? true : false;

    return newsCategoryRepo.create({
      title: data.title,
      category_slug,
      category_visibility: visibilityBool,
      category_summary: data.category_summary ?? null,
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
    });
  }

  static async update(
    id: number,
    data: Partial<{
      title: string;
      category_slug: string;
      category_visibility: string;
      category_summary: string;
      meta_title: string | null;
      meta_description: string | null;
    }> & { saveWithDate?: boolean }
  ): Promise<boolean> {
    const updateData: any = { ...data };

    if (data.title && !data.category_slug) {
      updateData.category_slug = slugify(data.title, { lower: true, strict: true });

      const existing = await newsCategoryRepo.findBySlug(updateData.category_slug);
      if (existing && existing.id !== id) {
        throw new Error("Category slug already exists");
      }
    } else if (data.category_slug) {
      const existing = await newsCategoryRepo.findBySlug(data.category_slug);
      if (existing && existing.id !== id) {
        throw new Error("Category slug already exists");
      }
    }

    if (data.category_visibility !== undefined) {
      updateData.category_visibility = data.category_visibility === "yes";
    }

    if (data.category_summary !== undefined) {
      updateData.category_summary = data.category_summary ?? null;
    }
    if (data.meta_title !== undefined) {
      updateData.meta_title = data.meta_title ?? null;
    }
    if (data.meta_description !== undefined) {
      updateData.meta_description = data.meta_description ?? null;
    }

    return newsCategoryRepo.update(id, updateData);
  }

  static async toggleVisibility(id: number, visible: boolean): Promise<NewsCategory | null> {
    const updated = await newsCategoryRepo.update(id, { category_visibility: visible });
    if (!updated) return null;
    return newsCategoryRepo.findById(id);
  }

  static async delete(id: number): Promise<void> {
    return newsCategoryRepo.delete(id);
  }
}
