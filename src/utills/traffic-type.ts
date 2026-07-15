export type TrafficType = "paid" | "organic" | "referral";

const PAID_MEDIUMS = new Set(["paid", "cpc", "ppc", "cpm"]);

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
