import { z } from "zod";

const pairSchema = z.object({
  university_id: z.coerce.number().int().positive("university_id is required"),
  university_course_id: z.coerce
    .number()
    .int()
    .positive("university_course_id is required"),
});

const optionalText = z
  .string()
  .trim()
  .optional()
  .nullable()
  .or(z.literal("").transform(() => null));

export const createCompareSetSchema = z.object({
  title: z
    .string()
    .trim()
    .max(255)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  description: optionalText,
  university_url: z
    .string()
    .trim()
    .max(2048, "University URL is too long")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  pairs: z
    .array(pairSchema)
    .length(2, "Exactly 2 universities are required"),
});

export const updateCompareSetSchema = createCompareSetSchema;
