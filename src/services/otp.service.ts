import OtpRepo from "../repositories/otp_verification.repository";
import { sendOtpEmail } from "../config/smtp";

class OtpService {
  // Generate 6-digit OTP
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Create and send OTP
  async createAndSendOtp(email: string): Promise<string> {
    // Delete any existing unused OTPs for this email
    await OtpRepo.deleteByEmail(email);

    // Generate new OTP
    const otp = this.generateOtp();

    // Set expiration to 5 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Save OTP to database
    await OtpRepo.create({
      email,
      otp,
      expires_at: expiresAt,
    });

    // Send OTP via email
    try {
      await sendOtpEmail(email, otp);
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      // Still return OTP for development/testing (remove in production if needed)
      throw new Error("Failed to send OTP email. Please try again.");
    }

    return otp; // Return for logging/testing (don't expose to client)
  }

  // Verify OTP
  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const otpRecord = await OtpRepo.findValidOtp(email, otp);

    if (!otpRecord) {
      return false;
    }

    // Mark OTP as used
    await OtpRepo.markAsUsed(otpRecord.id);

    return true;
  }

  // Clean up expired OTPs (can be called periodically)
  async cleanupExpiredOtps(): Promise<number> {
    return await OtpRepo.deleteExpiredOtps();
  }
}

export default new OtpService();
