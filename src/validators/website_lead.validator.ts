import { z } from "zod";

const requiredName = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(150, "Name must be at most 150 characters");

const optionalEmail = z
  .string()
  .trim()
  .email("Invalid email address")
  .max(255, "Email must be at most 255 characters")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalPhone = z
  .string()
  .trim()
  .max(20, "Phone must be at most 20 characters")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalTrimmed = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional()
    .or(z.literal("").transform(() => undefined));

const optionalUrl = z
  .string()
  .trim()
  .url("Invalid URL")
  .max(2048, "URL too long")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalOtp = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "OTP must be exactly 6 digits")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createWebsiteLeadSchema = z
  .object({
    name: requiredName,
    email: optionalEmail,
    phone: optionalPhone,
    course: optionalTrimmed("Course"),
    specialization: optionalTrimmed("Specialization"),
    state: optionalTrimmed("State", 100),
    city: optionalTrimmed("City", 100),
    lead_source: optionalTrimmed("Lead source", 150),
    sub_source: optionalTrimmed("Sub source", 150),
    utm_source: optionalTrimmed("UTM source", 255),
    utm_campaign: optionalTrimmed("UTM campaign", 255),
    utm_adgroup: optionalTrimmed("UTM adgroup", 255),
    utm_ads: optionalTrimmed("UTM ads", 255),
    website_url: optionalUrl,
    otp: optionalOtp,
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either email or phone is required",
        path: ["email"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either email or phone is required",
        path: ["phone"],
      });
    }
  });

export const verifyOtpSchema = z.object({
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
});
