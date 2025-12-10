/**
 * State Model
 * Represents an Indian state.
 */
export interface State {
  id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateStateDto {
  name: string;
  is_active?: boolean;
}

export interface UpdateStateDto {
  name?: string;
  is_active?: boolean;
}

