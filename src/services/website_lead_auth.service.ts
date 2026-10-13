import crypto from "crypto";
import jwt from "jsonwebtoken";
import { WebsiteLeadRepository } from "../repositories/website_lead.repository";
import { sendTataOtpSms } from "../utills/tataSms";
import { AppError } from "../middlewares/error.middleware";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const ACCESS_EXPIRES: any = process.env.JWT_ACCESS_EXPIRES_IN || "7d";
const OTP_TTL_MINUTES = 10;

const normalizeLocalPhone = (phone: string): string => {
  const digits = String(phone || "").replace(/\D/g, "");
  let local = digits;
  if (local.length === 12 && local.startsWith("91")) local = local.slice(2);
  if (local.length === 11 && local.startsWith("0")) local = local.slice(1);
  return local;
};

const generateOtp = (): string => String(crypto.randomInt(100000, 1000000));

/** Returning user: phone only → send OTP to existing lead */
export async function loginWithPhone(phone: string) {
  const localPhone = normalizeLocalPhone(phone);
  if (!/^[6-9]\d{9}$/.test(localPhone)) {
    throw new AppError("Enter a valid 10-digit mobile number", 400);
  }

  const lead = await WebsiteLeadRepository.findLatestByPhone(localPhone);
  if (!lead?.id) {
    throw new AppError("No lead found for this phone number", 404);
  }

  const otp = generateOtp();
  const smsResult = await sendTataOtpSms(localPhone, otp);
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await WebsiteLeadRepository.saveLoginOtp(lead.id, {
    otp,
    campaign_id: smsResult.campaignId ?? null,
    job_id: smsResult.jobId ?? null,
    custm_id: smsResult.cusTmId ?? null,
    otp_expires_at: otpExpiresAt,
  });

  return {
    message: "OTP sent successfully",
    phone: localPhone,
    lead_id: lead.id,
    expires_in_minutes: OTP_TTL_MINUTES,
  };
}

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
