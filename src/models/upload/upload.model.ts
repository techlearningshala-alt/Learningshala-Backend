/**
 * Upload Model
 * Represents an uploaded file (image or PDF).
 */
export interface Upload {
  id: number;
  name: string | null;
  file_path: string;
  file_type: "image" | "pdf";
  created_at: Date;
  updated_at: Date;
}

export interface CreateUploadDto {
  name?: string | null;
  file_path: string;
  file_type: "image" | "pdf";
}

export interface UpdateUploadDto {
  name?: string | null;
  file_path?: string;
  file_type?: "image" | "pdf";
}
