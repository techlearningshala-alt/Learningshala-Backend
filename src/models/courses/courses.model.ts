export interface Course {
  id: number;
  domain_id: number;       // FK → domains.id
  name: string;
  slug: string;
  h1Tag?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  label?: string | null;
  thumbnail: string;
  description?: string;
  course_duration?: string | null;
  duration_for_schema?: string | null; // JSON string: {"month": "6", "year": ""} or {"month": "", "year": "1"}
  eligibility?: string | null;
  eligibility_info?: string | null; // Eligibility with info button
  upload_brochure?: string | null;
  author_name?: string | null;
  learning_mode?: string | null;
  podcast_embed?: string | null;
  emi_facility?: boolean | null;
  priority: number;
  menu_visibility: string;
  is_active: string;
  placement_partner_ids?: number[] | null;
  emi_partner_ids?: number[] | null;
  created_at: Date;
  updated_at: Date;
}
