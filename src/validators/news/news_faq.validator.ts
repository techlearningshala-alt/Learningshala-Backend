import { z } from "zod";

export const createNewsFaqQuestionSchema = z.object({
  news_id: z.preprocess(
    (val) => Number(val),
    z.number().refine((val) => !isNaN(val), { message: "News ID must be a number" })
  ),
  title: z.string().min(1, "Question title is required"),
  description: z.string().min(1, "Answer/description is required"),
  saveWithDate: z.coerce.boolean().optional(),
});

export const updateNewsFaqQuestionSchema = z.object({
  news_id: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().refine((val) => !isNaN(val), { message: "News ID must be a number" }).optional()
  ),
  title: z.string().min(1, "Question title is required").optional(),
  description: z.string().min(1, "Answer/description is required").optional(),
  saveWithDate: z.coerce.boolean().optional(),
});
