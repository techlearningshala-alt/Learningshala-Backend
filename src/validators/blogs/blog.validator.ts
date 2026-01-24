import { z } from "zod";

export const createBlogSchema = z.object({
  category_id: z.coerce.number().int().positive("Category is required"),
  h1_tag: z.string().max(255, "H1 tag must be less than 255 characters").optional().nullable(),
  slug: z.string().max(255, "Slug must be less than 255 characters").optional().nullable(),
  meta_title: z.string().max(255, "Meta title must be less than 255 characters").optional().nullable(),
  meta_description: z.string().optional().nullable(),
  author_id: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  ),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  short_description: z.string().optional().nullable(),
  author_name: z.string().max(255, "Author name must be less than 255 characters").optional().nullable(),
  author_details: z.string().optional().nullable(),
  author_image: z.string().max(255, "Author image path must be less than 255 characters").optional().nullable(),
  thumbnail: z.string().max(255, "Thumbnail path must be less than 255 characters").optional().nullable(),
  verified: z.boolean().optional(),
  update_date: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
});

export const updateBlogSchema = z.object({
  category_id: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().int().positive("Category is required").optional()
  ),
  h1_tag: z.string().max(255, "H1 tag must be less than 255 characters").optional().nullable(),
  slug: z.string().max(255, "Slug must be less than 255 characters").optional().nullable(),
  meta_title: z.string().max(255, "Meta title must be less than 255 characters").optional().nullable(),
  meta_description: z.string().optional().nullable(),
  author_id: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  ),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters").optional(),
  short_description: z.string().optional().nullable(),
  author_name: z.string().max(255, "Author name must be less than 255 characters").optional().nullable(),
  author_details: z.string().optional().nullable(),
  author_image: z.string().max(255, "Author image path must be less than 255 characters").optional().nullable(),
  thumbnail: z.string().max(255, "Thumbnail path must be less than 255 characters").optional().nullable(),
  verified: z.boolean().optional(),
  update_date: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  saveWithDate: z.coerce.boolean().optional(),
});
