import { z } from "zod";

const optionalTrimmed = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional()
    .or(z.literal("").transform(() => undefined));

const requiredTrimmed = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

const optionalPhone = z
  .string()
  .trim()
  .max(20, "Phone must be at most 20 characters")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createKycFormSchema = z.object({
  full_name: requiredTrimmed("Full name", 150),
  dob: optionalTrimmed("DOB", 32),
  mobile: requiredTrimmed("Mobile", 20),
  alt_mobile: optionalPhone,
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be at most 255 characters"),
  pan: optionalTrimmed("PAN", 20),
  aadhaar: optionalTrimmed("Aadhaar", 20),
  gender: optionalTrimmed("Gender", 20),
  shop_name: optionalTrimmed("Shop name", 255),
  biz_type: optionalTrimmed("Business type", 150),
  address: z
    .string()
    .trim()
    .max(5000, "Address must be at most 5000 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  locality: optionalTrimmed("Locality", 255),
  city: optionalTrimmed("City", 150),
  pincode: optionalTrimmed("Pincode", 20),
  google_loc: optionalTrimmed("Google location", 512),
  footfall: optionalTrimmed("Footfall", 50),
  acc_holder: optionalTrimmed("Account holder", 150),
  bank_name: optionalTrimmed("Bank name", 150),
  acc_number: optionalTrimmed("Account number", 50),
  ifsc: optionalTrimmed("IFSC", 20),
  upi: optionalTrimmed("UPI", 100),
  coi: optionalTrimmed("COI", 20),
  coi_specify: optionalTrimmed("COI specify", 255),
  declaration_agree: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null) return false;
      if (typeof val === "boolean") return val;
      const normalized = String(val).trim().toLowerCase();
      return normalized === "true" || normalized === "1" || normalized === "yes";
    }),
});
