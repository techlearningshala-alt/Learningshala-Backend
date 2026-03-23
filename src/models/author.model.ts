export interface Author {
  id: number;
  author_name: string;
  image: string | null;
  author_details: string | null;
  label: string | null;
  author_slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: Date;
  updated_at: Date;
  author_blogs: { title: string | null, short_description: string | null, thumbnail: string | null }[];
}

export interface CreateAuthorDto {
  author_name: string;
  image: string | null;
  author_details: string | null;
  label: string | null;
  author_slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
}

export interface UpdateAuthorDto extends Partial<CreateAuthorDto> {}
