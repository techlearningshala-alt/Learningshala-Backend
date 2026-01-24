import repo from "../repositories/author.repository";
import { CreateAuthorDto, UpdateAuthorDto, Author } from "../models/author.model";

export const listAuthors = async (page = 1, limit = 10) => {
  return await repo.findAll(page, limit);
};

export const getAuthor = async (id: number): Promise<Author | null> => {
  return await repo.findById(id);
};

export const createAuthor = async (data: CreateAuthorDto): Promise<Author> => {
  return await repo.create(data);
};

export const updateAuthor = async (
  id: number,
  data: UpdateAuthorDto,
  saveWithDate = true
): Promise<boolean> => {
  return await repo.update(id, data, saveWithDate);
};

export const deleteAuthor = async (id: number): Promise<boolean> => {
  return await repo.delete(id);
};
