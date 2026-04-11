export type AuthorContentItem = {
  h1_tag: string | null;
  short_description: string | null;
  thumbnail: string | null;
  slug: string | null;
  verified: boolean | null;
  updated_at: Date | null;
  meta_title: string | null;
  meta_description: string | null;
  category_title: string | null;
};

export interface Author {
  id: number;
  author_name: string;
  image: string | null;
  author_details: string | null;
  label: string | null;
  author_slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  linkedin_profile_link: string | null;
  designation: string | null;
  education_background: string | null;
  created_at: Date;
  updated_at: Date;
  author_blogs?: AuthorContentItem[];
  author_news?: AuthorContentItem[];
}

export interface CreateAuthorDto {
  author_name: string;
  image: string | null;
  author_details: string | null;
  label: string | null;
  author_slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  linkedin_profile_link: string | null;
  designation: string | null;
  education_background: string | null;
}

export interface UpdateAuthorDto extends Partial<CreateAuthorDto> {}
