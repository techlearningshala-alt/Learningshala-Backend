import { z } from "zod";

export const createAuthorSchema = z.object({
  author_name: z.string().min(1, "Author name is required"),
  image: z.string().nullable().optional(),
  author_details: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  author_slug: z.string().max(255, "Author slug must be less than 255 characters").optional().nullable(),
  meta_title: z.string().max(255, "Meta title must be less than 255 characters").optional().nullable(),
  meta_description: z.string().nullable().optional(),
});

export const updateAuthorSchema = createAuthorSchema.partial();
