import { z } from "zod";

// ✅ Helper schemas
const bannerSchema = z.object({
  banner_image: z.string().optional(), // stored path or URL
  video_id: z.string().optional(),
  video_title: z.string().optional(),
});

const sectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  component: z.string().min(1, "Component name is required"),
  props: z.object({
    content: z.any().optional(), // editor JSON or text
  }).optional(),
});

// ✅ Base university schema
export const createUniversitySchema = z.object({
  university_name: z.string().min(1, "University name is required"),
  university_slug: z.string().optional(),
  meta_title: z.string().max(60, "Meta title must be 60 characters or less").optional().nullable(),
  meta_description: z.string().max(160, "Meta description must be 160 characters or less").optional().nullable(),
  university_logo: z.string().optional(),
  university_location: z.string().optional(),
  university_brochure: z.string().optional(),
  author_name: z.string().optional(),
  is_active: z
    .union([z.string(), z.boolean()])
    .transform((val) => val === "true" || val === true)
    .default(true),

  // ✅ Allow nested data (from JSON or direct object)
  banners: z
    .union([
      z.string().transform((val) => {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }),
      z.array(bannerSchema),
    ])
    .optional(),

  sections: z
    .union([
      z.string().transform((val) => {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }),
      z.array(sectionSchema),
    ])
    .optional(),
});

export const updateUniversitySchema = createUniversitySchema.partial();

// ✅ For safety, export inner schemas too (useful in services/controllers)
export const createBannerSchema = bannerSchema.extend({
  university_id: z.number().optional(),
});

export const updateBannerSchema = createBannerSchema.partial();

export const createSectionSchema = sectionSchema.extend({
  university_id: z.number().optional(),
});

export const updateSectionSchema = createSectionSchema.partial();


export const createUniversityApprovalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  logo: z.string().url("Logo must be a valid URL").optional(),
});

export const updateUniversityApprovalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  logo: z.string().url().optional(),
});

