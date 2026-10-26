export type HomeTitleDescriptionType = "home" | "static";

export interface HomeTitleDescription {
  id: number;
  type: HomeTitleDescriptionType | string;
  page: string;
  meta_title: string;
  meta_description: string;
  created_at: Date;
  updated_at: Date;
}
