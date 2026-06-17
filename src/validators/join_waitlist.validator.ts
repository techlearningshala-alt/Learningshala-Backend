import { z } from "zod";

export const createJoinWaitlistSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(150, "Full name must be at most 150 characters"),
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
  certification_program: z
    .string()
    .trim()
    .min(1, "Certification program is required")
    .max(255, "Certification program must be at most 255 characters"),
});
