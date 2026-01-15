export interface UniversityFaqCategory {
  id: number;
  heading: string;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

export interface UniversityFaq {
  id: number;
  university_id: number;
  category_id: number;
  title: string;        // Question
  description: string;  // Answer
  created_at: Date;
  updated_at: Date;
}

