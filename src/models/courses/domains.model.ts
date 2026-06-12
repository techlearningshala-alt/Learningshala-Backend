export interface DomainQuestionAnswer {
  answer: string;
  note: string;
}

export interface DomainQuestion {
  question: string;
  note: string;
  answers: DomainQuestionAnswer[]; // 4 answers, each with its own note
}

export interface Domain {
  id: number;
  name: string;
  label?: string;          // short label/badge text
  priority: number;       // ordering in list
  is_active: boolean;     // active/deactive toggle
  menu_visibility: boolean; // show/hide in menu
  slug: string;
  description: string;
  questions?: DomainQuestion[] | null; // stored as JSON in DB
  created_at: Date;
  updated_at: Date;
}
