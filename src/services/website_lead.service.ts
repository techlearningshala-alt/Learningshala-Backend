import { WebsiteLead } from "../models/website_lead.model";
import { WebsiteLeadRepository, ListWebsiteLeadOptions } from "../repositories/website_lead.repository";

const normalizeString = (val?: string | null) =>
  typeof val === "string" ? val.trim() || null : val ?? null;

const normalizePhone = (val?: string | null) => {
  if (!val) return null;
  const cleaned = String(val).replace(/\D/g, "");
  return cleaned || null;
};

const normalizeInterestedUniversities = (
  value?: string | string[] | null
): string | null => {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
    return cleaned.length ? JSON.stringify(cleaned) : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    return JSON.stringify([trimmed]);
  }

  return null;
};

const parseInterestedUniversities = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string" && item.trim());
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item === "string" && item.trim());
    }
  } catch {
    // Backward compatibility for old plain string rows
    if (value.trim()) return [value.trim()];
  }
  return [];
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
    click_source: normalizeString(payload.click_source),
    lead_url: normalizeString(payload.lead_url),
    interested_university: normalizeInterestedUniversities(payload.interested_university),
  };

  const created = await WebsiteLeadRepository.create(normalized);
  return {
    ...created,
    interested_university: parseInterestedUniversities(created.interested_university),
  };
}

export async function listWebsiteLeads(
  page = 1,
  limit = 10,
  options: ListWebsiteLeadOptions = {}
) {
  const result = await WebsiteLeadRepository.findAll(page, limit, options);
  result.data = (result.data || []).map((row: any) => ({
    ...row,
    interested_university: parseInterestedUniversities(row.interested_university),
  }));
  return result;
}

export async function verifyWebsiteLeadOtp(id: number, otp: string): Promise<boolean> {
  return WebsiteLeadRepository.verifyOtp(id, otp);
}

export async function updateInterestedUniversity(
  id: number,
  interestedUniversity?: string | string[] | null
): Promise<WebsiteLead | null> {
  const updated = await WebsiteLeadRepository.updateInterestedUniversity(
    id,
    normalizeInterestedUniversities(interestedUniversity)
  );
  if (!updated) return null;
  return {
    ...updated,
    interested_university: parseInterestedUniversities(updated.interested_university),
  };
}

