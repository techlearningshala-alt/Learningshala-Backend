import { z } from "zod";

const pairSchema = z.object({
  university_id: z.coerce.number().int().positive("university_id is required"),
  university_course_id: z.coerce
    .number()
    .int()
    .positive("university_course_id is required"),
});

export const createCompareSetSchema = z.object({
  title: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  pairs: z
    .array(pairSchema)
    .min(2, "At least 2 pairs are required")
    .max(20, "Maximum 20 pairs allowed"),
});

export const updateCompareSetSchema = createCompareSetSchema;
