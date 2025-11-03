export interface University {
  id: number;
  university_name: string;
  university_slug: string;
  university_logo?: string;
  university_location?: string;
  university_brochure?: string;
  author_name?: string;
  is_active: boolean;
  approval_id?: number[];
  placement_partner_ids?: number[];
  emi_partner_ids?: number[];
  created_at: Date;
  updated_at: Date;
}


export interface UniversityBanner {
  id: number;
  university_id: number;
  banner_image: string;
  video_id?: string;
  video_title?: string;
  created_at: Date;
  updated_at: Date;
}

export interface UniversitySection {
  id: number;
  university_id: number;
  title: string;
  component: string;
  props: any; // JSON (content editor data)
  created_at: Date;
  updated_at: Date;
}
