import { z } from "zod";

// Specialization FAQ Question Validation
export const createSpecializationFaqQuestionSchema = z.object({
  specialization_id: z.preprocess(
    (val) => Number(val),
    z.number().refine((val) => !isNaN(val), { message: "Specialization ID must be a number" })
  ),
  category_id: z.preprocess(
    (val) => Number(val),
    z.number().refine((val) => !isNaN(val), { message: "Category ID must be a number" })
  ),
  title: z.string().min(1, "Question title is required"),
  description: z.string().min(1, "Answer/description is required"),
  saveWithDate: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return true;
      if (typeof val === "boolean") return val;
      if (typeof val === "string") {
        const normalized = val.toLowerCase().trim();
        return normalized === "true" || normalized === "1" || normalized === "yes";
      }
      return Boolean(val);
    },
    z.boolean().optional()
  ),
});

export const updateSpecializationFaqQuestionSchema = z.object({
  specialization_id: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().refine((val) => !isNaN(val), { message: "Specialization ID must be a number" }).optional()
  ),
  category_id: z.preprocess(
    (val) => (val !== undefined ? Number(val) : undefined),
    z.number().refine((val) => !isNaN(val), { message: "Category ID must be a number" }).optional()
  ),
  title: z.string().min(1, "Question title is required").optional(),
  description: z.string().min(1, "Answer/description is required").optional(),
  saveWithDate: z.preprocess(
    (val) => {
      if (val === undefined || val === null) return true;
      if (typeof val === "boolean") return val;
      if (typeof val === "string") {
        const normalized = val.toLowerCase().trim();
        return normalized === "true" || normalized === "1" || normalized === "yes";
      }
      return Boolean(val);
    },
    z.boolean().optional()
  ),
});

