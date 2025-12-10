/**
 * City Model
 * Represents an Indian city linked to a state.
 */
export interface City {
  id: number;
  state_id: number;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  // Optional: populated when joining with states
  state_name?: string;
}

export interface CreateCityDto {
  state_id: number;
  name: string;
  is_active?: boolean;
}

export interface UpdateCityDto {
  state_id?: number;
  name?: string;
  is_active?: boolean;
}

