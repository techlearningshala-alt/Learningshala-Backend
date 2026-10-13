import jwt from "jsonwebtoken";
import { WebsiteLeadRepository } from "../repositories/website_lead.repository";
import { AppError } from "../middlewares/error.middleware";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const ACCESS_EXPIRES: any = process.env.JWT_ACCESS_EXPIRES_IN || "7d";

const normalizeLocalPhone = (phone: string): string => {
  const digits = String(phone || "").replace(/\D/g, "");
  let local = digits;
  if (local.length === 12 && local.startsWith("91")) local = local.slice(2);
  if (local.length === 11 && local.startsWith("0")) local = local.slice(1);
  return local;
};

export async function verifyOtpAndLogin(phone: string, otp: string) {
  const localPhone = normalizeLocalPhone(phone);
  if (!/^[6-9]\d{9}$/.test(localPhone)) {
    throw new AppError("Enter a valid 10-digit mobile number", 400);
  }

  const cleanedOtp = String(otp || "").trim();
  if (!/^\d{6}$/.test(cleanedOtp)) {
    throw new AppError("OTP must be exactly 6 digits", 400);
  }

  const lead = await WebsiteLeadRepository.findLatestByPhone(localPhone);
  if (!lead?.id) {
    throw new AppError("No lead found for this phone number", 404);
  }

  if (!lead.otp || String(lead.otp).trim() !== cleanedOtp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (lead.otp_expires_at) {
    const expiresAt = new Date(lead.otp_expires_at);
    if (!Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
      throw new AppError("OTP has expired. Please request a new one.", 400);
    }
  }

  await WebsiteLeadRepository.markOtpVerified(lead.id);

  const accessToken = jwt.sign(
    {
      id: lead.id,
      phone: localPhone,
      name: lead.name || null,
      type: "website_lead",
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  );

  return {
    accessToken,
    lead: {
      id: lead.id,
      name: lead.name,
      email: lead.email ?? null,
      phone: localPhone,
      otp_verified: true,
    },
  };
}
