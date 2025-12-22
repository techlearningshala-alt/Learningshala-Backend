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
  upload_brochure?: string | null;
  author_name?: string | null;
  learning_mode?: string | null;
  podcast_embed?: string | null;
  priority?: number | null;
  menu_visibility?: boolean;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}
