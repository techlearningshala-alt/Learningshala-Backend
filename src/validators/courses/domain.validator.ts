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
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  priority: z.number().int().nonnegative().default(999),
  is_active: z.boolean(),
  menu_visibility: z.boolean()
});

// Update Specialization
export const updateSpecializationSchema = z.object({
  course_id: z.number().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  priority: z.number().int().nonnegative().default(999),
  is_active: z.boolean().default(true),
  menu_visibility: z.boolean().default(true)
});


// Create Course
export const createCourseSchema = z.object({
  domain_id: z.number().min(1, "Domain ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  priority: z.number().optional(),
  is_active: z.boolean().default(true),
  menu_visibility: z.boolean().default(true)
});

// Update Course
export const updateCourseSchema = z.object({
  domain_id: z.number().min(1).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  priority: z.number().optional(),
  is_active: z.boolean().default(true),
  menu_visibility: z.boolean().default(true)
});
