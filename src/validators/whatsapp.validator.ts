import { z } from "zod";

export const createWhatsAppUniversitySchema = z.object({
  name: z.string().trim().min(1, "name is required").max(255),
  logo_url: z.string().trim().max(500).optional().nullable().or(z.literal("").transform(() => null)),
  // Plug in Meta Phone Number ID here after Embedded Signup
  phone_number_id: z.string().trim().min(1, "phone_number_id is required").max(64),
  // Plug in Meta WABA ID here after Embedded Signup
  waba_id: z.string().trim().min(1, "waba_id is required").max(64),
  display_number: z
    .string()
    .trim()
    .max(32)
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export const updateWhatsAppUniversitySchema = createWhatsAppUniversitySchema.partial();

export const sendWhatsAppMessageSchema = z.object({
  body: z.string().trim().min(1, "body is required").max(4096),
});

export const updateConversationStatusSchema = z.object({
  status: z.enum(["open", "closed"]),
});
