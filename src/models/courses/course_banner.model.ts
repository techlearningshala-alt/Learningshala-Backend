/**
 * Course Banner Model
 * Represents banner/video assets attached to a course.
 */
export interface CourseBanner {
  id: number;
  course_id: number;        // FK → courses.id
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
  created_at: Date;
  updated_at: Date;
}

