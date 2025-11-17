import { z } from "zod";

const nullableNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return null;
  const num = typeof val === "number" ? val : Number(val);
  return Number.isNaN(num) ? val : num;
}, z.union([z.number(), z.null()]));

const optionalNumber = z.preprocess((val) => {
  if (val === "" || val === null || val === undefined) return undefined;
  const num = Number(val);
  if (Number.isNaN(num)) {
    return val;
  }
  return num;
}, z.number().int().positive()).optional();

export const createUniversitySpecializationSchema = z.object({
  university_course_id: z.coerce.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).optional(),
  full_fees: nullableNumber.optional(),
  sem_fees: nullableNumber.optional(),
  duration: z.string().optional(),
  image: z.string().optional(),
  label: z.string().optional(),
  icon: z.string().optional(),
});

export const updateUniversitySpecializationSchema =
  createUniversitySpecializationSchema.partial().extend({
    saveWithDate: z
      .union([z.string(), z.boolean()])
      .optional(),
  });

export const listUniversitySpecializationQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  university_course_id: optionalNumber,
  search: z.string().optional(),
});

