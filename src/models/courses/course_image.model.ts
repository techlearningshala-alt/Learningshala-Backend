/**
 * Course Image Model
 * Represents an image associated with a course.
 */
export interface CourseImage {
  id: number;
  name: string;
  image: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCourseImageDto {
  name: string;
  image: string;
}

export interface UpdateCourseImageDto {
  name?: string;
  image?: string;
}

