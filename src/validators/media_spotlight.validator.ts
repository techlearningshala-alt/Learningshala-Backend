import { z } from "zod";

export const createMediaSpotlightSchema = z.object({
  title: z.string().min(3),
  logo: z.string().url("Logo must be a valid URL"),
  link: z.string().url("Link must be a valid URL"),
});

export const updateMediaSpotlightSchema = createMediaSpotlightSchema.partial();
