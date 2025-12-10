export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // hashed
  role: string;
  phone?: string | null;
  course?: string | null;
  state?: number | null;
  city?: number | null;
  otp?: string | null;
  created_at: Date;
  updated_at: Date;
}
