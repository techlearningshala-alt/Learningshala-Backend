export interface PostAdmissionTeamMember {
  id: number;
  name: string;
  thumbnail: string;
  experience: number;
  verified: boolean | number;
  assist_student: number;
  connection_link: string | null;
  label: string | null;
  created_at: Date;
  updated_at: Date;
}
