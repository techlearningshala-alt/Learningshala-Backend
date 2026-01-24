export interface HomeBanner {
  id: number;
  banner_image: string | null;
  video_id: string | null;
  video_title: string | null;
  url: string | null;
  created_at: Date;
  updated_at: Date;
}

export type CreateHomeBannerDto = Omit<HomeBanner, "id" | "created_at" | "updated_at">;
export type UpdateHomeBannerDto = Partial<CreateHomeBannerDto>;
