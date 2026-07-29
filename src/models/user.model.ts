export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // hashed
  role: string;
  can_create?: boolean | null;
  can_read?: boolean | null;
  can_update?: boolean | null;
  can_delete?: boolean | null;
  /** Allowed CMS sections: blog | news | university */
  section_access?: string[] | string | null;
  created_at: Date;
  updated_at: Date;
}
