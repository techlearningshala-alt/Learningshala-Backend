export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // hashed
  role: string;
  created_at: Date;
  updated_at: Date;
}
