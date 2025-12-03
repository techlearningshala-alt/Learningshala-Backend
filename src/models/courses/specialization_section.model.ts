/**
 * Specialization Section Model
 * Represents sections/content blocks for a specialization.
 */
export interface SpecializationSection {
  id: number;
  specialization_id: number;        // FK → specializations.id
  section_key: string;
  title: string;
  description?: string | null;
  image?: string | null; // Added for sections with images
  created_at: Date;
  updated_at: Date;
}

export interface SpecializationSectionInput {
  id?: number; // Added for updates
  section_key: string;
  title: string;
  description?: string | null;
  image?: string | null;
}

