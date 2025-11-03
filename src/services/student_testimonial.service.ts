import  TestimonialRepository  from "../repositories/student_testimonial.repository";
import { AppError } from "../middlewares/error.middleware";

const repo = new TestimonialRepository();


export const listTestimonials = (page = 1, limit = 10) => repo.findAll(page, limit);

export const getTestimonial = async (id: number) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Testimonial not found", 404);
  return item;
};

export const addTestimonial = async (payload: {
  name: string;
  video_id: string;
  video_title: string;
  thumbnail: string;
}) => {
  const id = await repo.create(payload);
  return { id, ...payload };
};

export const updateTestimonial = async (
  id: number,
  data: Partial<{ name: string; video_id: string; video_title: string; thumbnail: string }>,
  saveWithDate = true
) => {
  const exists = await repo.findById(id);
  if (!exists) throw new AppError("Testimonial not found", 404);
  const ok = await repo.update(id, data, saveWithDate);
  if (!ok) throw new AppError("No fields provided", 400);
  return { message: "Testimonial updated successfully" };
};

export const deleteTestimonial = async (id: number) => {
  const ok = await repo.delete(id);
  if (!ok) throw new AppError("Testimonial not found", 404);
  return { message: "Deleted successfully" };
};