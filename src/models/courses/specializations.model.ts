export interface Specialization {
  id: number;
  course_id: number;       // FK → courses.id
  name: string;
  slug: string;
  h1Tag?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  label?: string | null;
  thumbnail?: string | null;
  description?: string | null; // Used for specialization_intro
  course_duration?: string | null;
  duration_for_schema?: string | null; // JSON string: {"month": "6", "year": ""} or {"month": "", "year": "1"}
  eligibility?: string | null;
  eligibility_info?: string | null; // Eligibility with info button
  upload_brochure?: string | null;
  author_name?: string | null;
  learning_mode?: string | null;
  podcast_embed?: string | null;
  emi_facility?: boolean | null;
  priority?: number | null;
  placement_partner_ids?: number[] | null;
  menu_visibility?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
