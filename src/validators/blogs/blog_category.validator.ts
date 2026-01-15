import { z } from "zod";

export const createBlogCategorySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  category_slug: z.string().max(255, "Category slug must be less than 255 characters").optional(),
});

export const updateBlogCategorySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
  category_slug: z.string().max(255, "Category slug must be less than 255 characters").optional(),
  saveWithDate: z.boolean().optional(),
});
