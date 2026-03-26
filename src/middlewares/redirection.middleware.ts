import { Request, Response, NextFunction } from "express";
import * as RedirectionService from "../services/redirections/redirection.service";

const SKIP_PREFIXES = ["/api", "/uploads"];

function shouldSkip(req: Request): boolean {
  if (req.method !== "GET" && req.method !== "HEAD") return true;
  const p = req.path || "";
  if (SKIP_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))) return true;
  if (p === "/") return true;
  return false;
}

/**
 * Build candidate old_url strings that might be stored in DB (full URLs with http/https,
 * optional trailing slash on path, with/without query string).
 */
function buildOldUrlLookupKeys(req: Request): string[] {
  const host = req.get("host") || "";
  const originalUrl = req.originalUrl || req.url || "";
  const forwardedProto = (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim();
  const proto = forwardedProto || req.protocol || "http";
  const altProto = proto === "https" ? "http" : "https";

  const pathOnly = originalUrl.split("?")[0];
  const queryPart = originalUrl.includes("?") ? originalUrl.slice(originalUrl.indexOf("?")) : "";

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

/**
 * If the request URL matches a row's old_url, respond with 301 to new_url.
 * Skips API and static paths. Safe to place before /api routes.
 */
export function redirectionMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (shouldSkip(req)) {
    next();
    return;
  }

  const originalUrl = req.originalUrl || req.url || "";
  const hostname = req.hostname || (req.get("host") || "").split(":")[0];

  void (async () => {
    try {
      const keys = buildOldUrlLookupKeys(req);
      const match = await RedirectionService.resolveRedirectForRequest(hostname, originalUrl, keys);
      if (match?.new_url) {
        res.redirect(301, match.new_url);
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  })().catch(next);
}
