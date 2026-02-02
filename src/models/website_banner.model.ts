export interface WebsiteBanner {
  id: number;
  banner_image: string | null;
  video_id: string | null;
  video_title: string | null;
  url: string | null;
  banner_type: 'website' | 'mobile';
  created_at: Date;
  updated_at: Date;
}

export type CreateWebsiteBannerDto = Omit<WebsiteBanner, "id" | "created_at" | "updated_at">;
export type UpdateWebsiteBannerDto = Partial<CreateWebsiteBannerDto>;
