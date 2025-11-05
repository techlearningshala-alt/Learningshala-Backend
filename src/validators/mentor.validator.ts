import { z } from "zod";

export const createMentorSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  experience: z.number().min(0, "Experience must be >= 0"),
  verified: z.boolean(),
  assist_student: z.number(),
  connection_link: z.string(),
  label: z.string(),
  // status: z.enum(["published", "draft"]),
});


export const updateMentorSchema = createMentorSchema.partial();
