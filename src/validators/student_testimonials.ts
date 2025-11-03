import { z } from "zod";

export const createStudentTestimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  video_id: z.string().min(1, "Video ID is required"),
  video_title: z.string().min(1, "Video title is required"),
  thumbnail: z.string().optional(), // will come from multer usually
});
