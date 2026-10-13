import { HomeTitleDescriptionRepository } from "../repositories/home_title_description.repository";
import { AppError } from "../middlewares/error.middleware";

const repo = new HomeTitleDescriptionRepository();

export const listHomeTitleDescriptions = async (page = 1, limit = 10) =>
  await repo.findAll(page, limit);

export const getHomeTitleDescription = async (id: number) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Title & description not found", 404);
  return item;
};

export const addHomeTitleDescription = async (
  page: string,
  meta_title: string,
  meta_description: string
) => {
  await repo.create({ page, meta_title, meta_description });
  return { message: "Title & description created successfully" };
};

export const updateHomeTitleDescription = async (
  id: number,
  page?: string,
  meta_title?: string,
  meta_description?: string,
  saveWithDate = true
) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Title & description not found", 404);

  await repo.update(id, { page, meta_title, meta_description }, saveWithDate);
  return { message: "Title & description updated successfully" };
};

export const deleteHomeTitleDescription = async (id: number) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Title & description not found", 404);
  await repo.delete(id);
  return { message: "Title & description deleted successfully" };
};
