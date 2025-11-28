/**
 * Course Section Model
 * Represents sections/content blocks for a course.
 */
export interface CourseSection {
  id: number;
  course_id: number;        // FK → courses.id
  section_key: string;
  title: string;
  description?: string | null;
  image?: string | null;
  created_at: Date;
  updated_at: Date;
}

