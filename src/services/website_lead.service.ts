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

const hasSequentialChars = (s: string, len = 5): boolean => {
  const lower = String(s || "").toLowerCase();
  const n = lower.length;
  if (n < len) return false;

  for (let i = 0; i <= n - len; i += 1) {
    const sub = lower.slice(i, i + len);
    if (sub.includes(" ")) continue;
    if (!/^[a-z0-9]+$/.test(sub)) continue;

    let ok = true;
    for (let j = 1; j < len; j += 1) {
      if (sub.charCodeAt(j) !== sub.charCodeAt(j - 1) + 1) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
};

const isSequentialDigits = (digits: string, len = 6): boolean => {
  const n = digits.length;
  if (n < len) return false;
  for (let i = 0; i <= n - len; i += 1) {
    const sub = digits.slice(i, i + len);
    let ok = true;
    for (let j = 1; j < len; j += 1) {
      if (sub.charCodeAt(j) !== sub.charCodeAt(j - 1) + 1) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
};

const strictValidateWebsiteLeadPayload = (payload: WebsiteLead) => {
  const errors: string[] = [];

  const trimmedName = String(payload.name || "").trim();
  const lowerName = trimmedName.toLowerCase();
  const bannedDummyNames = [
    "test", "testing", "demo", "user", "admin",
    "name", "fullname", "sample", "temp", "trial",
    "abc", "xyz", "qwerty", "asdf", "zxcv",
    "random", "none", "na", "n/a",
    "123456", "111111", "000000", "999999",
  ];

  let nameError: string | null = null;
  if (!trimmedName || trimmedName.length < 2 || trimmedName.length > 50) {
    nameError = "Invalid name";
  } else if (!/^[A-Za-z0-9 ]+$/.test(trimmedName)) {
    nameError = "Invalid name";
  } else if (bannedDummyNames.includes(lowerName)) {
    nameError = "Invalid name";
  } else if (/([a-z0-9])\1{3}/.test(lowerName)) {
    nameError = "Invalid name";
  } else if (hasSequentialChars(lowerName, 5)) {
    nameError = "Invalid name";
  }
  if (nameError) errors.push(nameError);

  const emailLower = String(payload.email || "").trim().toLowerCase();
  const emailMatch = /^([^@]+)@([^@]+)$/.exec(emailLower);
  const emailLocal = emailMatch ? emailMatch[1] : "";
  const emailDomain = emailMatch ? emailMatch[2] : "";

  const tempDomains = [
    "mailinator.com", "10minutemail.com", "guerrillamail.com", "yopmail.com", "tempmail.com",
    "throwawaymail.com", "fakeinbox.com", "getnada.com", "trashmail.com", "moakt.com",
  ];
  const allowedDomains = [
    "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com", "rediffmail.com",
    "icloud.com", "ymail.com",
  ];

  let invalidEmail = false;
  if (!emailLower || emailLower.length > 100) invalidEmail = true;
  else if (emailLower.includes("..")) invalidEmail = true;
  else if (!emailMatch) invalidEmail = true;
  else if (!allowedDomains.includes(emailDomain)) invalidEmail = true;
  else if (tempDomains.includes(emailDomain)) invalidEmail = true;
  else {
    if (!/[aeiou]/.test(emailLocal)) invalidEmail = true;
    if (!invalidEmail && /([a-z0-9])\1{3,}/i.test(emailLocal)) invalidEmail = true;
  }
  if (invalidEmail) errors.push("Invalid email");

  const phoneDigits = String(payload.phone || "").replace(/\D/g, "");
  let invalidPhone = false;
  if (phoneDigits.length !== 10) invalidPhone = true;
  else if (!/^[6-9][0-9]{9}$/.test(phoneDigits)) invalidPhone = true;
  else if (phoneDigits === "0000000000" || phoneDigits === "1234567890") invalidPhone = true;
  else if (/^(\d)\1{9}$/.test(phoneDigits)) invalidPhone = true;
  else {
    const counts: Record<string, number> = {};
    for (let i = 0; i < phoneDigits.length; i += 1) {
      const d = phoneDigits[i];
      counts[d] = (counts[d] || 0) + 1;
    }
    if (Object.values(counts).some((count) => count >= 7)) invalidPhone = true;
    if (!invalidPhone && isSequentialDigits(phoneDigits, 6)) invalidPhone = true;
  }
  if (invalidPhone) errors.push("Invalid phone");

  const state = String(payload.state || "").trim();
  const course = String(payload.course || "").trim();
  if (!state || state.length > 80) errors.push("Invalid state");
  if (!course || course.length > 100) errors.push("Invalid course");

  if (errors.length) {
    const err: any = new Error(errors.join(", "));
    err.statusCode = 400;
    throw err;
  }
};

export async function createWebsiteLead(payload: WebsiteLead): Promise<WebsiteLead> {
  strictValidateWebsiteLeadPayload(payload);
  // Normalize OTP - if provided, validate it's 6 digits, otherwise use default
  let otpValue = "123456"; // Default OTP
  if (payload.otp) {
    const cleanedOtp = String(payload.otp).trim().replace(/\D/g, "");
    if (cleanedOtp.length === 6) {
      otpValue = cleanedOtp;
    }
  }

  const normalizedUtmSource = normalizeString(payload.utm_source);
  const resolvedLeadSource = normalizedUtmSource || "website";

  const normalized: WebsiteLead = {
    name: payload.name.trim(),
    email: normalizeString(payload.email),
    phone: normalizePhone(payload.phone),
    course: normalizeString(payload.course),
    specialization: normalizeString(payload.specialization),
    state: normalizeString(payload.state),
    city: normalizeString(payload.city),
    // Keep DB behavior in sync with webhook rule:
    // use utm_source when available, otherwise default to "website".
    lead_source: resolvedLeadSource,
    sub_source: normalizeString(payload.sub_source),
    utm_source: normalizedUtmSource,
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

