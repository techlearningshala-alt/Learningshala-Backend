import { z } from "zod";

const trimToNull = (value: unknown) => {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

// ✅ Required trimmed string with only letters, spaces, hyphens
const requiredTrimmedString = (fieldName: string, max = 255) =>
  z.preprocess(
    (v) => String(v ?? "").trim(),
    z
      .string()
      .min(1, `${fieldName} is required`)
      .max(max, `${fieldName} must be at most ${max} characters`)
      .regex(/^[a-zA-Z0-9\s\-\.,&()]+$/, `${fieldName} contains invalid characters`)
  );

// ✅ Optional string (letters/spaces allowed)
const optionalTrimmedString = (fieldName: string, max = 255) =>
  z
    .preprocess((v) => trimToNull(v),
      z.union([
        z
          .string()
          .max(max, `${fieldName} must be at most ${max} characters`)
          .regex(/^[a-zA-Z0-9\s\-\.,&()]+$/, `${fieldName} contains invalid characters`),
        z.null()
      ])
    )
    .optional();

// ✅ Email with stricter domain check
const optionalEmail = z
  .preprocess((v) => trimToNull(v),
    z.union([
      z
        .string()
        .email("Invalid email format")
        .max(150, "Email must be at most 150 characters")
        .refine((email) => {
          // Check for common domain typos
          const invalidDomains = [
            "gmmail.com",
            "gmil.com",
            "gmaill.com",
            "yahoom.com",
            "outlok.com",
            "hotmial.com",
          ];
          const domain = email.split("@")[1]?.toLowerCase() || "";
          return !invalidDomains.includes(domain);
        }, "Invalid email domain — please check your spelling (e.g., gmail.com, yahoo.com, etc.)"),
      z.null(),
    ])
  )
  .optional();


// ✅ Phone number (10–15 digits, allows +91 or similar)
const optionalPhone = z
  .preprocess((v) => {
    const trimmed = trimToNull(v);
    if (typeof trimmed !== "string") return trimmed;
    const numeric = trimmed.replace(/[^\d]/g, "");
    return numeric.length ? numeric : null;
  },
    z.union([
      z.string().regex(/^\d{10}$/, "Phone must contain 10 digits"),
      z.null()
    ])
  )
  .optional();

// ✅ Numeric field (with limit & decimal control)
const optionalNumericString = (
  fieldName: string,
  {
    maxDigits = 10,
    allowDecimal = false,
    maxValue,
  }: { maxDigits?: number; allowDecimal?: boolean; maxValue?: number } = {}
) => {
  const pattern = allowDecimal
    ? new RegExp(`^\\d{1,${maxDigits}}(?:\\.\\d{1,2})?$`)
    : new RegExp(`^\\d{1,${maxDigits}}$`);

  return z
    .preprocess((v) => trimToNull(v),
      z.union([
        z
          .string()
          .regex(pattern, `${fieldName} must be numeric${allowDecimal ? " (up to 2 decimals)" : ""}`)
          .superRefine((val, ctx) => {
            const num = Number(val);
            if (maxValue !== undefined && num > maxValue) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `${fieldName} must not exceed ${maxValue}`,
              });
            }
          }),
        z.null()
      ])
    )
    .optional();
};

// ✅ Boolean-like labels only
const optionalBooleanLabel = () =>
  z
    .preprocess((v) => {
      const trimmed = trimToNull(v);
      if (typeof trimmed !== "string") return trimmed;
      const norm = trimmed.toLowerCase();
      if (["yes", "true", "1"].includes(norm)) return "Yes";
      if (["no", "false", "0"].includes(norm)) return "No";
      return trimmed;
    }, z.union([z.literal("Yes"), z.literal("No"), z.null()]))
    .optional();

// ✅ URL validation with optional domain whitelist
const optionalUrl = (fieldName: string) =>
  z
    .preprocess((v) => trimToNull(v),
      z.union([
        z
          .string()
          .url("Invalid URL format")
          .max(2048, `${fieldName} is too long`)
          .refine((url) => /^https?:\/\//.test(url), "URL must start with http or https"),
        z.null()
      ])
    )
    .optional();

// ✅ Valid date (not in future, not before 2000)
const optionalDate = z
  .preprocess((v:any) => {
    if (!v) return null;
    const date = new Date(v);
    return Number.isNaN(date.getTime()) ? undefined : date;
  },
    z.union([z.date(), z.null()])
  )
  .refine(
    (date) => !date || (date >= new Date("2000-01-01") && date <= new Date()),
    { message: "Date must be valid and not in the future" }
  )
  .optional();

// ✅ Final validated schema
export const createLeadSchema = z
  .object({
    name: requiredTrimmedString("Name", 150),
    email: optionalEmail,
    phone: optionalPhone,
    course: optionalTrimmedString("Course", 150),
    university: optionalTrimmedString("University", 255),
    specialisation: optionalTrimmedString("Specialisation", 150),
    state: optionalTrimmedString("State", 100),
    city: optionalTrimmedString("City", 100),
    lead_source: optionalTrimmedString("Lead source", 150),
    sub_source: optionalTrimmedString("Sub source", 150),
    highest_qualification: optionalTrimmedString("Highest qualification", 150),

    preferred_budget: optionalNumericString("Preferred budget", { maxDigits: 10, allowDecimal: true }),
    emi_required: optionalBooleanLabel(),
    salary: optionalNumericString("Salary", { maxDigits: 10, allowDecimal: true, maxValue: 10000000 }),
    percentage: optionalNumericString("Percentage", { maxDigits: 5, allowDecimal: true, maxValue: 100 }),
    experience: optionalTrimmedString("Experience", 150),

    currently_employed: optionalBooleanLabel(),
    university_for_placement_salaryhike_promotions: optionalTrimmedString("University for placement/salary hike/promotions", 255),

    utm_source: optionalTrimmedString("UTM source", 150),
    utm_campaign: optionalTrimmedString("UTM campaign", 150),
    utm_adgroup: optionalTrimmedString("UTM ad group", 150),
    utm_ads: optionalTrimmedString("UTM ads", 150),

    created_on: optionalDate,
    website_url: optionalUrl("Website URL"),
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either email or phone must be provided",
        path: ["email"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either email or phone must be provided",
        path: ["phone"],
      });
    }
  });

// ✅ Update schema (name is optional, phone or email required for identification)
export const updateLeadSchema = z
  .object({
    name: optionalTrimmedString("Name", 150),
    email: optionalEmail,
    phone: optionalPhone,
    course: optionalTrimmedString("Course", 150),
    university: optionalTrimmedString("University", 255),
    specialisation: optionalTrimmedString("Specialisation", 150),
    state: optionalTrimmedString("State", 100),
    city: optionalTrimmedString("City", 100),
    lead_source: optionalTrimmedString("Lead source", 150),
    sub_source: optionalTrimmedString("Sub source", 150),
    highest_qualification: optionalTrimmedString("Highest qualification", 150),

    preferred_budget: optionalNumericString("Preferred budget", { maxDigits: 10, allowDecimal: true }),
    emi_required: optionalBooleanLabel(),
    salary: optionalNumericString("Salary", { maxDigits: 10, allowDecimal: true, maxValue: 10000000 }),
    percentage: optionalNumericString("Percentage", { maxDigits: 5, allowDecimal: true, maxValue: 100 }),
    experience: optionalTrimmedString("Experience", 150),

    currently_employed: optionalBooleanLabel(),
    university_for_placement_salaryhike_promotions: optionalTrimmedString("University for placement/salary hike/promotions", 255),

    utm_source: optionalTrimmedString("UTM source", 150),
    utm_campaign: optionalTrimmedString("UTM campaign", 150),
    utm_adgroup: optionalTrimmedString("UTM ad group", 150),
    utm_ads: optionalTrimmedString("UTM ads", 150),

    created_on: optionalDate,
    website_url: optionalUrl("Website URL"),
  })
  .superRefine((data, ctx) => {
    // For update, we need either phone or email to identify the lead
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either email or phone must be provided to identify the lead",
        path: ["email"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Either email or phone must be provided to identify the lead",
        path: ["phone"],
      });
    }
  });

// ✅ Query validation schema
export const listLeadQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().max(150, "Search term must be at most 150 characters").optional(),
});
