import { z } from "zod";

// Domains
export const createDomainSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  priority: z.number().int().nonnegative().default(999),
  is_active: z.boolean().default(true),
  menu_visibility: z.boolean().default(true)
});

export const updateDomainSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  priority: z.number().int().nonnegative().default(999),
  is_active: z.boolean().default(true),
  menu_visibility: z.boolean().default(true)
});

// Create Specialization
export const createSpecializationSchema = z.object({
  course_id: z.number().min(1, "Course ID is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  h1Tag: z.string().min(1, "H1 Tag is required"),
  label: z.string().optional(),
  description: z.string().optional().nullable(), // Used for specialization_intro
  course_duration: z.string().optional().nullable(),
  upload_brochure: z.string().optional().nullable(),
  author_name: z.string().optional().nullable(),
  learning_mode: z.string().optional().nullable(),
  podcast_embed: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  priority: z.number().optional(),
  is_active: z.boolean().default(true),
  menu_visibility: z.boolean().default(true)
});

// Update Specialization
export const updateSpecializationSchema = createSpecializationSchema.partial();


// Create Course
export const createCourseSchema = z.object({
  domain_id: z.number().min(1, "Domain ID is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  h1Tag: z.string().min(1, "H1 Tag is required"),
  label: z.string().optional(),
  description: z.string().optional().nullable(),
  course_duration: z.string().optional().nullable(),
  upload_brochure: z.string().optional().nullable(),
  author_name: z.string().optional().nullable(),
  learning_mode: z.string().optional().nullable(),
  podcast_embed: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  priority: z.number().optional(),
  placement_partner_ids: z.array(z.number().int()).optional(),
  emi_partner_ids: z.array(z.number().int()).optional(),
  is_active: z.boolean().default(true),
  menu_visibility: z.boolean().default(true)
});

// Update Course
export const updateCourseSchema = z.object({
  domain_id: z.number().min(1).optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  h1Tag: z.string().optional(),
  label: z.string().optional(),
  description: z.string().optional().nullable(),
  course_duration: z.string().optional().nullable(),
  upload_brochure: z.string().optional().nullable(),
  author_name: z.string().optional().nullable(),
  learning_mode: z.string().optional().nullable(),
  podcast_embed: z.string().optional().nullable(),
  thumbnail: z.string().optional().nullable(),
  priority: z.number().optional(),
  placement_partner_ids: z.array(z.number().int()).optional(),
  emi_partner_ids: z.array(z.number().int()).optional(),
  is_active: z.boolean().default(true),
  menu_visibility: z.boolean().default(true)
});
