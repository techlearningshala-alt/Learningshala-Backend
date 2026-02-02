import websiteBannerRepo from "../repositories/website_banner.repository";
import { CreateWebsiteBannerDto, UpdateWebsiteBannerDto, WebsiteBanner } from "../models/website_banner.model";

export const listWebsiteBanners = async (page: number, limit: number, bannerType?: 'website' | 'mobile') => {
  return websiteBannerRepo.findAll(page, limit, bannerType);
};

export const getWebsiteBanner = async (id: number): Promise<WebsiteBanner | null> => {
  return websiteBannerRepo.findById(id);
};

export const createWebsiteBanner = async (payload: CreateWebsiteBannerDto): Promise<WebsiteBanner> => {
  return websiteBannerRepo.create(payload);
};

export const updateWebsiteBanner = async (id: number, payload: UpdateWebsiteBannerDto, saveWithDate: boolean): Promise<WebsiteBanner | null> => {
  return websiteBannerRepo.update(id, payload, saveWithDate);
};

export const deleteWebsiteBanner = async (id: number): Promise<boolean> => {
  return websiteBannerRepo.delete(id);
};
