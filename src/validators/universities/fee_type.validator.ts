import { z } from "zod";

const titleSchema = z.preprocess((val) => {
  if (typeof val === "string") {
    return val.trim();
  }
  return val;
}, z.string().min(1, "Title is required"));

export const createFeeTypeSchema = z.object({
  title: titleSchema,
});

export const updateFeeTypeSchema = z
  .object({
    title: titleSchema.optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );

export const listFeeTypeQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});


