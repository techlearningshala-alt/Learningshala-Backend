export interface Domain {
  id: number;
  name: string;
  label?: string;          // short label/badge text
  priority: number;       // ordering in list
  is_active: boolean;     // active/deactive toggle
  menu_visibility: boolean; // show/hide in menu
  slug: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}