import { z } from "zod";

// Category Validation
export const createUniversityFaqCategorySchema = z.object({
  heading: z.string().min(1, "Category heading is required"),
  priority: z.number().int().nonnegative().default(999),
});

export const updateUniversityFaqCategorySchema = z.object({
  heading: z.string().min(1, "Category heading is required").optional(),
  priority: z.number().int().nonnegative().default(999).optional(),
});

// Question Validation
export const createUniversityFaqQuestionSchema = z.object({
  university_id: z.preprocess(
    (val) => Number(val),
    z.number().refine((val) => !isNaN(val), { message: "University ID must be a number" })
  ),
  category_id: z.preprocess(
    (val) => Number(val),
    z.number().refine((val) => !isNaN(val), { message: "Category ID must be a number" })
  ),
  title: z.string().min(1, "Question title is required"),
  description: z.string().min(1, "Answer/description is required"),
});

export const updateUniversityFaqQuestionSchema = z.object({
  university_id: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().refine((val) => !isNaN(val), { message: "University ID must be a number" }).optional()
  ),
  category_id: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().refine((val) => !isNaN(val), { message: "Category ID must be a number" }).optional()
  ),
  title: z.string().min(1, "Question title is required").optional(),
  description: z.string().min(1, "Answer/description is required").optional(),
});

