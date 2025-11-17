import { UniversitySpecialization } from "./university_specialization.model";

/**
 * University Course Model
 * Represents a course offered by a university.
 */
export interface UniversityCourse {
  id: number;
  university_id: number;
  name: string;
  slug: string;
  duration?: string | null;
  label?: string | null;
  course_thumbnail?: string | null;
  author_name?: string | null;
  is_active: boolean;
  syllabus_file?: string | null;
  brochure_file?: string | null;
  fee_type_values?: Record<string, number> | null;
  banner?: {
    banner_image?: string | null;
    brochure_file?: string | null;
    video_id?: string | null;
    video_title?: string | null;
  } | null;
  created_at: Date;
  updated_at: Date;
  specializations?: UniversitySpecialization[] | null;
}

export interface CreateUniversityCourseDto {
  university_id: number;
  name: string;
  slug: string;
  duration?: string | null;
  label?: string | null;
  course_thumbnail?: string | null;
  author_name?: string | null;
  is_active?: boolean;
  syllabus_file?: string | null;
  brochure_file?: string | null;
  fee_type_values?: Record<string, number> | null;
}

export interface UpdateUniversityCourseDto {
  university_id?: number;
  name?: string;
  slug?: string;
  duration?: string | null;
  label?: string | null;
  course_thumbnail?: string | null;
  author_name?: string | null;
  is_active?: boolean;
  syllabus_file?: string | null;
  brochure_file?: string | null;
  fee_type_values?: Record<string, number> | null;
  saveWithDate?: boolean;
}


