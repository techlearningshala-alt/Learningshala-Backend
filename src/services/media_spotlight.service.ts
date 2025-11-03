import { MediaSpotlightRepository } from "../repositories/media_spotlight.repository";
import { AppError } from "../middlewares/error.middleware";

const repo = new MediaSpotlightRepository();

export const listMedia = async (page = 1, limit = 10) => await repo.findAll(page, limit);


export const getMedia = async (id: number) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Media spotlight not found", 404);
  return item;
};

export const addMedia = async (title: string, logo: string, link: string) => {
  await repo.create({ title, logo, link });
  return { message: "Media spotlight created successfully" };
};

export const updateMedia = async (
  id: number,
  title?: string,
  logo?: string,
  link?: string,
  saveWithDate: boolean = true
) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Media spotlight not found", 404);
console.log(saveWithDate,"date")
  await repo.update(id, { title, logo, link }, saveWithDate);

  return { message: "Media spotlight updated successfully" };
};

export const reorderMediaSpotlight = async (
  order: { id: number; position: number }[]
) => {
  if (!Array.isArray(order) || order.length === 0) {
    throw new AppError("Invalid order payload", 400);
  }
  await repo.reorder(order);
  return { message: "Media spotlight order updated successfully" };
};

export const deleteMedia = async (id: number) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Media spotlight not found", 404);
  await repo.delete(id);
  return { message: "Media spotlight deleted successfully" };
};
