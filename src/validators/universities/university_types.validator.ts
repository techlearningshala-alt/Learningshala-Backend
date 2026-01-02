import { z } from "zod";

export const createUniversityTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
});

export const updateUniversityTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters").optional(),
  saveWithDate: z.boolean().optional(),
});

