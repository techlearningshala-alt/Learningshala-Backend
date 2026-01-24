import { z } from "zod";

export const createHomeBannerSchema = z.object({
  banner_image: z.string().nullable().optional(),
  video_id: z.string().nullable().optional(),
  video_title: z.string().nullable().optional(),
  url: z.string().max(500, "URL must be less than 500 characters").nullable().optional(),
});

export const updateHomeBannerSchema = createHomeBannerSchema.partial();
