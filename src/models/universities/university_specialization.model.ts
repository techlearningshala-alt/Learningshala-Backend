/**
 * University Specialization Model
 * Represents a specialization offered by a university.
 */

export interface UniversitySpecialization {
  id: number;
  university_course_id: number;
  name: string;
  slug: string;
  full_fees?: number | null;
  sem_fees?: number | null;
  duration?: string | null;
  image?: string | null;
  label?: string | null;
  icon?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUniversitySpecializationDto {
  university_course_id: number;
  name: string;
  slug: string;
  full_fees?: number | null;
  sem_fees?: number | null;
  duration?: string | null;
  image?: string | null;
  label?: string | null;
  icon?: string | null;
}

export interface UpdateUniversitySpecializationDto {
  university_course_id?: number;
  name?: string;
  slug?: string;
  full_fees?: number | null;
  sem_fees?: number | null;
  duration?: string | null;
  image?: string | null;
  label?: string | null;
  icon?: string | null;
  saveWithDate?: boolean;
}

