/**
 * Fee Type Model
 * Represents a named fee type with a generated key that can be attached to universities or courses.
 */
export interface FeeType {
  id: number;
  title: string;
  fee_key: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateFeeTypeDto {
  title: string;
  fee_key: string;
}

export interface UpdateFeeTypeDto {
  title?: string;
}


