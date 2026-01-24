import homeBannerRepo from "../repositories/home_banner.repository";
import { CreateHomeBannerDto, UpdateHomeBannerDto, HomeBanner } from "../models/home_banner.model";

export const listHomeBanners = async (page: number, limit: number) => {
  return homeBannerRepo.findAll(page, limit);
};

export const getHomeBanner = async (id: number): Promise<HomeBanner | null> => {
  return homeBannerRepo.findById(id);
};

export const createHomeBanner = async (payload: CreateHomeBannerDto): Promise<HomeBanner> => {
  return homeBannerRepo.create(payload);
};

export const updateHomeBanner = async (id: number, payload: UpdateHomeBannerDto, saveWithDate: boolean): Promise<HomeBanner | null> => {
  return homeBannerRepo.update(id, payload, saveWithDate);
};

export const deleteHomeBanner = async (id: number): Promise<boolean> => {
  return homeBannerRepo.delete(id);
};
