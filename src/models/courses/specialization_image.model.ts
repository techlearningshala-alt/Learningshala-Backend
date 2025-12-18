/**
 * Specialization Image Model
 * Represents an image associated with a specialization.
 */
export interface SpecializationImage {
  id: number;
  name: string;
  image: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSpecializationImageDto {
  name: string;
  image: string;
}

export interface UpdateSpecializationImageDto {
  name?: string;
  image?: string;
}

