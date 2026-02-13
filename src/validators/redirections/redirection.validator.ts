import { z } from "zod";

// Create Redirection
export const createRedirectionSchema = z.object({
  old_url: z.string().min(1, "Old URL is required").url("Old URL must be a valid URL"),
  new_url: z.string().min(1, "New URL is required").url("New URL must be a valid URL"),
});

// Update Redirection
export const updateRedirectionSchema = createRedirectionSchema.partial();
