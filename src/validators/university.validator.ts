import { z } from "zod";

export const createUniversitySchema = z.object({
  name: z.string().min(2),
  university_logo: z.string().url("University logo must be a valid URL"),
});

export const updateUniversitySchema = createUniversitySchema.partial();
