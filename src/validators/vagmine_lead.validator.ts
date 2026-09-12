import { z } from "zod";

export const createVagmineLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(150, "Name must be at most 150 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters"),
  number: z
    .string()
    .trim()
    .min(1, "Number is required")
    .max(20, "Number must be at most 20 characters"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message must be at most 5000 characters"),
});
