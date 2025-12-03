/**
 * Specialization Banner Model
 * Represents banner/video assets attached to a specialization.
 */
export interface SpecializationBanner {
  id: number;
  specialization_id: number;        // FK → specializations.id
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SpecializationBannerInput {
  id?: number; // Added for updates
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
}

