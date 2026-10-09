import { z } from "zod";

export const createHomeTitleDescriptionSchema = z.object({
  meta_title: z.string().min(1, "Meta title is required").max(255),
  meta_description: z.string().min(1, "Meta description is required"),
});

export const updateHomeTitleDescriptionSchema =
  createHomeTitleDescriptionSchema.partial().extend({
    saveWithDate: z.union([z.boolean(), z.string()]).optional(),
  });
