import { BlogRepository } from "../../repositories/blogs/blog.repository";
import { Blog } from "../../models/blogs/blog.model";

const blogRepo = new BlogRepository();

export class BlogService {
  static async list(page: number, limit: number, options: { search?: string; category_id?: number } = {}) {
    return blogRepo.findAll(page, limit, options);
  }

  static async get(id: number): Promise<Blog | null> {
    return blogRepo.findById(id);
  }

  static async create(data: {
    category_id: number;
    title: string;
    short_description?: string | null;
    author_name?: string | null;
    author_details?: string | null;
    author_image?: string | null;
    thumbnail?: string | null;
    verified?: boolean;
    update_date?: string | null;
    content?: string | null;
  }): Promise<Blog> {
    // Validate category_id exists
    if (!data.category_id) {
      throw new Error("Category is required");
    }

    // Convert update_date string to Date if provided, otherwise set to current date
    let updateDate: Date | null = null;
    if (data.update_date) {
      updateDate = new Date(data.update_date);
      if (isNaN(updateDate.getTime())) {
        throw new Error("Invalid update date format");
      }
    } else {
      // Set to current date if not provided
      updateDate = new Date();
    }

    return blogRepo.create({
      category_id: data.category_id,
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
    
    // Convert saveWithDate to boolean (handles both boolean and string "true"/"false")
    let saveWithDate = true; // default to true
    if (data.saveWithDate !== undefined) {
      if (typeof data.saveWithDate === 'string') {
        saveWithDate = data.saveWithDate === 'true' || data.saveWithDate === '1';
      } else {
        saveWithDate = Boolean(data.saveWithDate);
      }
    }

    // Handle update_date based on saveWithDate flag
    if (saveWithDate) {
      // If saveWithDate is true, set to current date
      updateData.update_date = new Date();
    } else if (data.update_date !== undefined) {
      // If saveWithDate is false, only update if explicitly provided
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
    // If saveWithDate is false and update_date is not provided, don't update the field

    // Keep saveWithDate in updateData so repository can use it for updated_at handling
    updateData.saveWithDate = saveWithDate;

    return blogRepo.update(id, updateData);
  }

  static async delete(id: number): Promise<void> {
    return blogRepo.delete(id);
  }

  static async toggleVerified(id: number, verified: boolean): Promise<Blog | null> {
    const updated = await blogRepo.update(id, { verified });
    if (!updated) return null;
    return blogRepo.findById(id);
  }
}
