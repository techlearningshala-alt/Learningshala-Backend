export interface University {
  id: number;
  university_name: string;
  university_slug?: string | null;
  university_logo: string | null;
  compare_information?: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
}
