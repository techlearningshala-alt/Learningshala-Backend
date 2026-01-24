export interface BlogFaqCategory {
  id: number;
  heading: string;
  priority: number;
  created_at: Date;
  updated_at: Date;
}

export interface BlogFaq {
  id: number;
  blog_id: number;
  title: string;        // Question
  description: string;  // Answer
  created_at: Date;
  updated_at: Date;
}
