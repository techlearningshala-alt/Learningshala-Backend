import { z } from "zod";

export const createPostAdmissionTeamSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  experience: z.number().min(0, "Experience must be >= 0"),
  verified: z.boolean(),
  assist_student: z.number().optional().nullable(),
  qualification: z.string().optional().nullable(),
  connection_link: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
});

export const updatePostAdmissionTeamSchema = createPostAdmissionTeamSchema.partial();
