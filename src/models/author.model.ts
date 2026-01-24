export interface Author {
  id: number;
  author_name: string;
  image: string | null;
  author_details: string | null;
  label: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAuthorDto {
  author_name: string;
  image: string | null;
  author_details: string | null;
  label: string | null;
}

export interface UpdateAuthorDto extends Partial<CreateAuthorDto> {}
