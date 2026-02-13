import RedirectionRepo from "../../repositories/redirections/redirection.repository";
import { Redirection } from "../../models/redirections/redirection.model";

const repo = new RedirectionRepo();

export const listRedirections = (page = 1, limit = 20, search?: string) => repo.findAll(page, limit, search);

export const getRedirection = (id: number) => repo.findById(id);

export const getRedirectionByOldUrl = (oldUrl: string) => repo.findByOldUrl(oldUrl);

export const addRedirection = async (item: Partial<Redirection>) => {
  return await repo.create(item);
};

export const updateRedirection = async (id: number, item: Partial<Redirection>) => {
  return await repo.update(id, item);
};

export const deleteRedirection = async (id: number) => {
  return await repo.delete(id);
};
