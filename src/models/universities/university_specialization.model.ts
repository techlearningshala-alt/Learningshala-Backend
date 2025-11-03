export interface UniversitySpecialization {
  id: number;
  university_course_id: number; // FK → university_courses.id
  specialization_id: number;    // FK → specializations.id
  created_at: Date;
  updated_at: Date;
}
