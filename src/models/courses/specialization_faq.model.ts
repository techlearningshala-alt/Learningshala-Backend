export interface SpecializationFaq {
  id: number;
  specialization_id: number;
  category_id: number;
  title: string;        // Question
  description: string;  // Answer
  created_at: Date;
  updated_at: Date;
}

