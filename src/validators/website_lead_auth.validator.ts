import { z } from "zod";

const phoneSchema = z
  .string()
  .min(10, "Phone is required")
  .refine((val) => {
    const digits = String(val).replace(/\D/g, "");
    let local = digits;
    if (local.length === 12 && local.startsWith("91")) local = local.slice(2);
    if (local.length === 11 && local.startsWith("0")) local = local.slice(1);
    return /^[6-9]\d{9}$/.test(local);
  }, "Enter a valid 10-digit mobile number");

export const websiteLeadLoginSchema = z.object({
  phone: phoneSchema,
});

export const websiteLeadVerifyOtpSchema = z.object({
  phone: phoneSchema,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});
