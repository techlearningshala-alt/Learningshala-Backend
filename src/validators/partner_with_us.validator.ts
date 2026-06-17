import { z } from "zod";

export const createPartnerWithUsSchema = z.object({
  institution_name: z
    .string()
    .trim()
    .min(1, "Institution name is required")
    .max(255, "Institution name must be at most 255 characters"),
  contact_person_name: z
    .string()
    .trim()
    .min(1, "Contact person name is required")
    .max(150, "Contact person name must be at most 150 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .max(20, "Phone must be at most 20 characters"),
  designation: z
    .string()
    .trim()
    .min(1, "Designation is required")
    .max(150, "Designation must be at most 150 characters"),
});
