export interface Mentor {
  id: number;
  name: string;
  thumbnail: string;
  experience: number;
  verified: boolean;
  assist_student: number;
  connection_link: string;
  label: "top rated" | "popular" | string; 
  // status: "published" | "draft";
  created_at: Date;
  updated_at: Date;
}
