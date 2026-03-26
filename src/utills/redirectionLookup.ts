import type { Request } from "express";

/**
 * Candidate old_url strings for DB lookup (http/https, trailing slash, query variants).
 */
export function buildOldUrlLookupKeys(host: string, pathnameWithSearch: string, proto: string): string[] {
  const altProto = proto === "https" ? "http" : "https";

  const pathOnly = pathnameWithSearch.split("?")[0];
  const queryPart = pathnameWithSearch.includes("?") ? pathnameWithSearch.slice(pathnameWithSearch.indexOf("?")) : "";

  const pathVariants = new Set<string>();
  pathVariants.add(pathOnly);
  if (pathOnly !== "/" && pathOnly.length > 1) {
    if (pathOnly.endsWith("/")) {
      pathVariants.add(pathOnly.replace(/\/+$/, "") || "/");
    } else {
      pathVariants.add(`${pathOnly}/`);
    }
  }

  const keys: string[] = [];
  const add = (u: string) => {
    if (u && !keys.includes(u)) keys.push(u);
  };

  for (const pv of pathVariants) {
    for (const pr of [proto, altProto]) {
      add(`${pr}://${host}${pv}${queryPart}`);
      if (queryPart) {
        add(`${pr}://${host}${pv}`);
      }
    }
  }

  return keys;
}

export function buildOldUrlLookupKeysFromExpressRequest(req: Request): string[] {
  const host = req.get("host") || "";
  const originalUrl = req.originalUrl || req.url || "";
  const forwardedProto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim();
  const proto = forwardedProto || req.protocol || "http";
  return buildOldUrlLookupKeys(host, originalUrl, proto);
}

export function buildOldUrlLookupKeysFromHref(urlString: string): string[] {
  const parsed = new URL(urlString);
  const proto = (parsed.protocol.replace(":", "") || "http") as string;
  const host = parsed.host;
  const pathnameWithSearch = parsed.pathname + parsed.search;
  return buildOldUrlLookupKeys(host, pathnameWithSearch, proto);
}
