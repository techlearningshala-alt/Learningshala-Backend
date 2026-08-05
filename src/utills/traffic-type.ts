export type TrafficType = "paid" | "organic" | "referral";

/** Admin "paid" filter + traffic_type derivation */
const PAID_MEDIUMS = new Set(["paid", "meta", "google", "cpc", "ppc", "cpm"]);

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

/** Derive traffic_type from lead_url UTMs. Keeps utm_source column behavior unchanged. */
export function deriveTrafficTypeFromLeadUrl(leadUrl?: string | null): TrafficType {
  if (!leadUrl || !String(leadUrl).trim()) return "organic";

  const url = String(leadUrl).trim();
  const medium = getQueryParam(url, "utm_medium");
  const source = getQueryParam(url, "utm_source");

  if (medium && PAID_MEDIUMS.has(medium)) return "paid";
  if (medium === "organic") return "organic";
  if (source) return "referral";
  return "organic";
}
