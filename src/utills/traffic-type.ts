export type TrafficType = "paid" | "organic";

/** Admin "paid" filter + traffic_type derivation */
const PAID_MEDIUMS = new Set(["paid", "meta", "google", "cpc", "ppc", "cpm"]);

/**
 * AI / LLM utm_source values treated as organic (case-insensitive / partial match).
 * Any other non-paid utm_source is also organic for now.
 */
const ORGANIC_UTM_SOURCES = [
  "chatgpt.com",
  "chatgpt",
  "google gemini",
  "gemini",
  "perplexity",
  "claude",
  "copilot",
  "groq",
  "deepseek",
];

/** Webhook override mediums (source=Meta, sub_source_new=LS-META-IGNOU) */
const META_PAID_WEBHOOK_MEDIUMS = new Set(["meta", "paid", "google"]);

export const META_PAID_SOURCE = "Meta";
export const META_PAID_SUB_SOURCE = "LS-META-IGNOU";

function getQueryParam(url: string, key: string): string | null {
  try {
    const parsed = new URL(url);
    const value = parsed.searchParams.get(key);
    return value ? value.trim().toLowerCase() : null;
  } catch {
    // Fallback for incomplete / relative URLs
    const match = new RegExp(`[?&]${key}=([^&#]*)`, "i").exec(url);
    if (!match?.[1]) return null;
    try {
      return decodeURIComponent(match[1]).trim().toLowerCase();
    } catch {
      return match[1].trim().toLowerCase();
    }
  }
}

export function getUtmMediumFromLeadUrl(leadUrl?: string | null): string | null {
  if (!leadUrl || !String(leadUrl).trim()) return null;
  return getQueryParam(String(leadUrl).trim(), "utm_medium");
}

/** True when lead_url has any utm_* query param */
export function leadUrlHasUtmParams(leadUrl?: string | null): boolean {
  if (!leadUrl || !String(leadUrl).trim()) return false;
  const url = String(leadUrl).trim();
  try {
    const parsed = new URL(url);
    for (const key of parsed.searchParams.keys()) {
      if (key.toLowerCase().startsWith("utm_")) return true;
    }
    return false;
  } catch {
    return /[?&]utm_[^=&#]+=/i.test(url);
  }
}

/** Meta / paid / Google → special webhook + fixed source/sub_source */
export function isMetaPaidWebhookMedium(medium?: string | null): boolean {
  if (!medium) return false;
  return META_PAID_WEBHOOK_MEDIUMS.has(String(medium).trim().toLowerCase());
}

export function shouldUseMetaPaidWebhook(leadUrl?: string | null): boolean {
  if (!leadUrlHasUtmParams(leadUrl)) return false;
  return isMetaPaidWebhookMedium(getUtmMediumFromLeadUrl(leadUrl));
}

/** True for known AI/LLM utm_source values (ChatGPT, Gemini, etc.). */
export function isOrganicUtmSource(source?: string | null): boolean {
  if (!source) return false;
  const normalized = String(source).trim().toLowerCase().replace(/\+/g, " ");
  return ORGANIC_UTM_SOURCES.some(
    (token) => normalized === token || normalized.includes(token)
  );
}

/**
 * Derive traffic_type from lead_url UTMs.
 * Paid mediums → paid.
 * AI sources (ChatGPT.com, Google Gemini, Perplexity, Claude, Copilot, Groq, Deepseek)
 * and all other non-paid traffic (including former referral) → organic.
 */
export function deriveTrafficTypeFromLeadUrl(leadUrl?: string | null): TrafficType {
  if (!leadUrl || !String(leadUrl).trim()) return "organic";

  const medium = getQueryParam(String(leadUrl).trim(), "utm_medium");
  if (medium && PAID_MEDIUMS.has(medium)) return "paid";

  return "organic";
}
