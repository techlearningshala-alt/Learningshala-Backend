export interface BlogCategory {
  id: number;
  title: string;
  category_slug: string;
  category_visibility?: boolean;
  created_at: Date;
  updated_at: Date;
}
