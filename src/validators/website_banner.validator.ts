import { z } from "zod";

export const createWebsiteBannerSchema = z.object({
  banner_image: z.string().nullable().optional(),
  video_id: z.string().nullable().optional(),
  video_title: z.string().nullable().optional(),
  url: z.string().max(500, "URL must be less than 500 characters").nullable().optional(),
  banner_type: z.enum(['website', 'mobile'], {
    message: "Banner type is required and must be either 'website' or 'mobile'",
  }),
});

export const updateWebsiteBannerSchema = createWebsiteBannerSchema.partial();
