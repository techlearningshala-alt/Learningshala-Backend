import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().default("mentor"),
  can_create: z.boolean().optional().default(false),
  can_read: z.boolean().optional().default(true),
  can_update: z.boolean().optional().default(false),
  can_delete: z.boolean().optional().default(false),
});

export const updateUserSchema = createUserSchema.partial().extend({
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

