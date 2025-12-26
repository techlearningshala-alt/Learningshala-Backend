import { z } from "zod";

// Question Validation
export const createUniversityCourseFaqQuestionSchema = z.object({
  course_id: z.preprocess(
    (val) => Number(val),
    z.number().refine((val) => !isNaN(val), { message: "Course ID must be a number" })
  ),
  category_id: z.preprocess(
    (val) => Number(val),
    z.number().refine((val) => !isNaN(val), { message: "Category ID must be a number" })
  ),
  title: z.string().min(1, "Question title is required"),
  description: z.string().min(1, "Answer/description is required"),
});

export const updateUniversityCourseFaqQuestionSchema = z.object({
  course_id: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().refine((val) => !isNaN(val), { message: "Course ID must be a number" }).optional()
  ),
  category_id: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().refine((val) => !isNaN(val), { message: "Category ID must be a number" }).optional()
  ),
  title: z.string().min(1, "Question title is required").optional(),
  description: z.string().min(1, "Answer/description is required").optional(),
});

