import { z } from "zod";

export const createNewsCategorySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  category_slug: z.string().max(255, "Category slug must be less than 255 characters").optional(),
  category_summary: z.string().optional(),
  meta_title: z.string().max(255, "Meta title must be less than 255 characters").optional(),
  meta_description: z.string().optional(),
  category_visibility: z
    .enum(["yes", "no"])
    .optional()
    .default("no"),
});

export const updateNewsCategorySchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
  category_slug: z.string().max(255, "Category slug must be less than 255 characters").optional(),
  category_summary: z.string().optional(),
  meta_title: z.string().max(255, "Meta title must be less than 255 characters").optional(),
  meta_description: z.string().optional(),
  category_visibility: z.enum(["yes", "no"]).optional(),
  saveWithDate: z.boolean().optional(),
});
