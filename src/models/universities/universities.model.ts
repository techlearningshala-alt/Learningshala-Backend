export interface University {
  id: number;
  university_name: string;
  university_slug: string;
  meta_title?: string | null;
  meta_description?: string | null;
  university_logo?: string;
  university_location?: string;
  university_brochure?: string;
  author_name?: string;
  university_type_id?: number | null;
  is_active: boolean;
  is_page_created: boolean;
  menu_visibility: boolean;
  provide_emi: boolean;
  approval_id?: number[];
  placement_partner_ids?: number[];
  emi_partner_ids?: number[];
  // Compare Information fields
  university_tag_line?: string | null;
  establishment_year?: string | null;
  emi_provides?: boolean;
  university_features?: string[] | null;
  education_mode?: string | null;
  examination_mode?: string | null;
  alumni_status?: string | null;
  online_classes?: boolean;
  placement_assistance?: boolean;
  why_choose?: string[] | null;
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
