import slugify from "slugify";
import { BlogCategoryRepository } from "../../repositories/blogs/blog_category.repository";
import { BlogCategory } from "../../models/blogs/blog_category.model";

const blogCategoryRepo = new BlogCategoryRepository();

export class BlogCategoryService {
  static async list(page: number, limit: number) {
    return blogCategoryRepo.findAll(page, limit);
  }

  static async get(id: number): Promise<BlogCategory | null> {
    return blogCategoryRepo.findById(id);
  }

  static async getBySlug(slug: string): Promise<BlogCategory | null> {
    return blogCategoryRepo.findBySlug(slug);
  }

  static async create(data: { title: string; category_slug?: string }): Promise<BlogCategory> {
    // Generate slug from title if not provided
    const category_slug = data.category_slug || slugify(data.title, { lower: true, strict: true });
    
    // Check if slug already exists
    const existing = await blogCategoryRepo.findBySlug(category_slug);
    if (existing) {
      throw new Error("Category slug already exists");
    }

    return blogCategoryRepo.create({
      title: data.title,
      category_slug,
    });
  }

  static async update(
    id: number,
    data: Partial<{ title: string; category_slug: string }> & { saveWithDate?: boolean }
  ): Promise<boolean> {
    const updateData: any = { ...data };

    // If title is being updated and category_slug is not provided, generate slug from title
    if (data.title && !data.category_slug) {
      updateData.category_slug = slugify(data.title, { lower: true, strict: true });
      
      // Check if the new slug already exists (excluding current record)
      const existing = await blogCategoryRepo.findBySlug(updateData.category_slug);
      if (existing && existing.id !== id) {
        throw new Error("Category slug already exists");
      }
    } else if (data.category_slug) {
      // If category_slug is provided, check if it already exists (excluding current record)
      const existing = await blogCategoryRepo.findBySlug(data.category_slug);
      if (existing && existing.id !== id) {
        throw new Error("Category slug already exists");
      }
    }

    return blogCategoryRepo.update(id, updateData);
  }

  static async delete(id: number): Promise<void> {
    return blogCategoryRepo.delete(id);
  }
}
