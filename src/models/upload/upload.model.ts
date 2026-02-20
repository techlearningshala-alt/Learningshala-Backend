/**
 * Upload Model
 * Represents an uploaded file (image, PDF, or video).
 */
export interface Upload {
  id: number;
  name: string | null;
  file_path: string;
  file_type: "image" | "pdf" | "video";
  created_at: Date;
  updated_at: Date;
}

export interface CreateUploadDto {
  name?: string | null;
  file_path: string;
  file_type: "image" | "pdf" | "video";
}

export interface UpdateUploadDto {
  name?: string | null;
  file_path?: string;
  file_type?: "image" | "pdf" | "video";
}
