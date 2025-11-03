export interface Specialization {
  id: number;
  course_id: number;       // FK → courses.id
  name: string;
  slug: string;
  thumbnail: string;
  description?: string;
  priority: number;
  is_active : Boolean
  menu_visibility : Boolean
  created_at: Date;
  updated_at: Date;
}
