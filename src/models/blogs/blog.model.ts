export interface Blog {
  id: number;
  category_id: number;
  title: string;
  short_description: string | null;
  author_name: string | null;
  author_details: string | null;
  author_image: string | null;
  thumbnail: string | null;
  verified: boolean;
  update_date: Date | null;
  content: string | null;
  created_at: Date;
  updated_at: Date;
  category_title?: string;
  category_slug?: string;
}
