export interface UniversityCourse {
  id: number;
  university_id: number; // FK → universities.id
  course_id: number;      // FK → courses.id
  duration?: string;      // e.g. "3 Years"
  intake?: number;        // number of seats per year
  created_at: Date;
  updated_at: Date;
}
