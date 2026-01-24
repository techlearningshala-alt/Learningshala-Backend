export interface Blog {
  id: number;
  category_id: number;
  h1_tag: string | null;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  author_id: number | null;
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
