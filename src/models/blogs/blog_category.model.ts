export interface BlogCategory {
  id: number;
  title: string;
  category_slug: string;
  category_visibility?: boolean;
  category_summary?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  created_at: Date;
  updated_at: Date;
}
