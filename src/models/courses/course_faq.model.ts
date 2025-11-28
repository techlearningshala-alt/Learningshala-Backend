export interface CourseFaqCategory {
  id: number;
  heading: string;
  created_at: Date;
  updated_at: Date;
}

export interface CourseFaq {
  id: number;
  course_id: number;
  category_id: number;
  title: string;        // Question
  description: string;  // Answer
  created_at: Date;
  updated_at: Date;
}

