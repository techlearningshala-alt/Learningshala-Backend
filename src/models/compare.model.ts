export type ComparePair = {
  id?: number;
  compare_set_id?: number;
  sort_order: number;
  university_id: number;
  university_course_id: number;
  university_name?: string | null;
  course_name?: string | null;
  university_logo?: string | null;
  banner?: string | null;
  created_at?: Date;
  updated_at?: Date;
};

export type CompareSet = {
  id?: number;
  title?: string | null;
  description?: string | null;
  university_url?: string | null;
  pairs?: ComparePair[];
  pair_count?: number;
  created_at?: Date;
  updated_at?: Date;
};

export type CreateCompareSetDto = {
  title?: string | null;
  description?: string | null;
  university_url?: string | null;
  pairs: Array<{
    university_id: number;
    university_course_id: number;
  }>;
};

export type UpdateCompareSetDto = CreateCompareSetDto;
