import { z } from "zod";

const optionalNumber = z
  .preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const num = Number(val);
    if (Number.isNaN(num)) {
      return val;
    }
    return num;
  }, z.number().int().positive())
  .optional();

export const createUniversityCourseSchema = z.object({
  university_id: z.coerce.number().int().positive(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1).optional(),
  h1Tag: z.string().optional(),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  duration: z.string().optional(),
  label: z.string().optional(),
  course_thumbnail: z.string().optional(),
  author_name: z.string().optional(),
  is_active: z
    .union([z.string(), z.boolean(), z.number()])
    .optional(),
  syllabus_file: z.string().optional(),
  brochure_file: z.string().optional(),
  course_banner: z.string().optional(),
  video_id: z.string().optional(),
  video_title: z.string().optional(),
  fee_type_values: z
    .union([
      z.string(),
      z.record(z.string(), z.any()),
    ])
    .optional(),
  banners: z.string().optional(), // JSON string of banners array
}).passthrough(); // Allow extra fields to pass through

export const updateUniversityCourseSchema = createUniversityCourseSchema
  .partial()
  .extend({
    saveWithDate: z
      .union([z.string(), z.boolean()])
      .optional(),
  });

export const listUniversityCourseQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  university_id: optionalNumber,
  specialization_id: optionalNumber,
  search: z.string().optional(),
});

