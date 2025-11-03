export interface Course {
  id: number;
  domain_id: number;       // FK → domains.id
  name: string;
  slug: string;
  thumbnail: string;
  description?: string;
  priority: number;
  menu_visibility: string;
  is_active: string;
  created_at: Date;
  updated_at: Date;
}
