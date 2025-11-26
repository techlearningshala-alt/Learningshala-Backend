/**
 * University Course Specialization Model
 * Represents a specialization offered by a university course.
 */

export interface UniversityCourseSpecialization {
  id: number;
  university_id: number;
  university_course_id: number;
  name: string;
  slug: string;
  h1Tag?: string | null;
  duration?: string | null;
  label?: string | null;
  course_thumbnail?: string | null;
  author_name?: string | null;
  is_active: boolean;
  is_page_created: boolean;
  syllabus_file?: string | null;
  brochure_file?: string | null;
  fee_type_values?: Record<string, number> | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUniversityCourseSpecializationDto {
  university_id: number;
  university_course_id: number;
  name: string;
  slug: string;
  h1Tag?: string | null;
  duration?: string | null;
  label?: string | null;
  course_thumbnail?: string | null;
  author_name?: string | null;
  is_active?: boolean;
  is_page_created?: boolean;
  syllabus_file?: string | null;
  brochure_file?: string | null;
  fee_type_values?: Record<string, number> | null;
}

export interface UpdateUniversityCourseSpecializationDto {
  university_id?: number;
  university_course_id?: number;
  name?: string;
  slug?: string;
  h1Tag?: string | null;
  duration?: string | null;
  label?: string | null;
  course_thumbnail?: string | null;
  author_name?: string | null;
  is_active?: boolean;
  is_page_created?: boolean;
  syllabus_file?: string | null;
  brochure_file?: string | null;
  fee_type_values?: Record<string, number> | null;
  saveWithDate?: boolean;
}

