import { WebsiteLead } from "../models/website_lead.model";
import { WebsiteLeadRepository } from "../repositories/website_lead.repository";

const normalizeString = (val?: string | null) =>
  typeof val === "string" ? val.trim() || null : val ?? null;

const normalizePhone = (val?: string | null) => {
  if (!val) return null;
  const cleaned = String(val).replace(/\D/g, "");
  return cleaned || null;
};

export async function createWebsiteLead(payload: WebsiteLead): Promise<WebsiteLead> {
  // Normalize OTP - if provided, validate it's 6 digits, otherwise use default
  let otpValue = "123456"; // Default OTP
  if (payload.otp) {
    const cleanedOtp = String(payload.otp).trim().replace(/\D/g, "");
    if (cleanedOtp.length === 6) {
      otpValue = cleanedOtp;
    }
  }

  const normalized: WebsiteLead = {
    name: payload.name.trim(),
    email: normalizeString(payload.email),
    phone: normalizePhone(payload.phone),
    course: normalizeString(payload.course),
    specialization: normalizeString(payload.specialization),
    state: normalizeString(payload.state),
    city: normalizeString(payload.city),
    lead_source: normalizeString(payload.lead_source),
    sub_source: normalizeString(payload.sub_source),
    utm_source: normalizeString(payload.utm_source),
    utm_campaign: normalizeString(payload.utm_campaign),
    utm_adgroup: normalizeString(payload.utm_adgroup),
    utm_ads: normalizeString(payload.utm_ads),
    website_url: normalizeString(payload.website_url),
    otp: otpValue,
  };

  return WebsiteLeadRepository.create(normalized);
}

export async function verifyWebsiteLeadOtp(id: number, otp: string): Promise<boolean> {
  return WebsiteLeadRepository.verifyOtp(id, otp);
}

