export interface OtpVerification {
  id: number;
  email: string;
  otp: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}
