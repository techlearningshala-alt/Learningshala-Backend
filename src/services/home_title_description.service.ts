import { HomeTitleDescriptionRepository } from "../repositories/home_title_description.repository";
import { AppError } from "../middlewares/error.middleware";

const repo = new HomeTitleDescriptionRepository();

const normalizeType = (type?: string) => {
  const value = String(type || "home").trim().toLowerCase();
  if (value !== "home" && value !== "static") {
    throw new AppError("type must be 'home' or 'static'", 400);
  }
  return value;
};

export const listHomeTitleDescriptions = async (
  page = 1,
  limit = 10,
  type?: string
) => {
  const normalizedType = type ? normalizeType(type) : undefined;
  return await repo.findAll(page, limit, normalizedType);
};

export const getHomeTitleDescription = async (id: number) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Title & description not found", 404);
  return item;
};

export const addHomeTitleDescription = async (
  page: string,
  meta_title: string,
  meta_description: string,
  type = "home"
) => {
  const normalizedType = normalizeType(type);
  await repo.create({
    type: normalizedType,
    page,
    meta_title,
    meta_description,
  });
  return { message: "Title & description created successfully" };
};

export const updateHomeTitleDescription = async (
  id: number,
  page?: string,
  meta_title?: string,
  meta_description?: string,
  saveWithDate = true,
  type?: string
) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Title & description not found", 404);

  const patch: {
    type?: string;
    page?: string;
    meta_title?: string;
    meta_description?: string;
  } = { page, meta_title, meta_description };

  if (type !== undefined) {
    patch.type = normalizeType(type);
  }

  await repo.update(id, patch, saveWithDate);
  return { message: "Title & description updated successfully" };
};

export const deleteHomeTitleDescription = async (id: number) => {
  const item = await repo.findById(id);
  if (!item) throw new AppError("Title & description not found", 404);
  await repo.delete(id);
  return { message: "Title & description deleted successfully" };
};
