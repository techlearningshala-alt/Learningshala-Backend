/**
 * University Course Banner Model
 * Represents banner/video assets attached to a university course.
 */
export interface UniversityCourseBanner {
  id: number;
  course_id: number;
  banner_key: string;
  banner_image?: string | null;
  video_id?: string | null;
  video_title?: string | null;
  created_at: Date;
  updated_at: Date;
}


