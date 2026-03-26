import { Request, Response, NextFunction } from "express";
import * as RedirectionService from "../services/redirections/redirection.service";

const SKIP_PREFIXES = ["/api", "/uploads"];

function shouldSkip(req: Request): boolean {
  if (req.method !== "GET" && req.method !== "HEAD") return true;

  const p = req.path || "";

  if (SKIP_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`))) {
    return true;
  }

  if (p === "/") return true;

  return false;
}

/**
 * Build candidate old_url strings that might be stored in DB
 */
function buildOldUrlLookupKeys(req: Request): string[] {

  // FIX: Get correct host behind nginx
  const rawHost =
    (req.headers["x-forwarded-host"] as string) ||
    req.get("host") ||
    "";

  // normalize host
  const host = rawHost
    .replace(/^www\./, "")
    .replace(/:80$/, "")
    .replace(/:443$/, "");

  const originalUrl = req.originalUrl || req.url || "";

  const forwardedProto = (req.headers["x-forwarded-proto"] as string)
    ?.split(",")[0]
    ?.trim();

  const proto =
    forwardedProto ||
    req.protocol ||
    "https";

  const altProto = proto === "https" ? "http" : "https";

  const pathOnly = originalUrl.split("?")[0];

  const queryPart = originalUrl.includes("?")
    ? originalUrl.slice(originalUrl.indexOf("?"))
    : "";

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
    if (u && !keys.includes(u)) {
      keys.push(u);
    }
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
 * Redirection Middleware
 */
export async function redirectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {

  console.log("🔥 REDIRECTION MIDDLEWARE HIT:", req.originalUrl);

  if (shouldSkip(req)) {
    return next();
  }

  try {

    const originalUrl = req.originalUrl || req.url || "";

    // FIX: Get correct hostname behind nginx
    const hostname =
      (req.headers["x-forwarded-host"] as string)?.split(":")[0] ||
      req.hostname ||
      (req.get("host") || "").split(":")[0];

    const keys = buildOldUrlLookupKeys(req);

    console.log("HOST:", hostname);
    console.log("ORIGINAL URL:", originalUrl);
    console.log("LOOKUP KEYS:", keys);

    const match = await RedirectionService.resolveRedirectForRequest(
      hostname,
      originalUrl,
      keys
    );

    if (match?.new_url) {
      console.log("REDIRECT FOUND:", match.new_url);
      return res.redirect(301, match.new_url);
    }

    next();

  } catch (err) {
    next(err);
  }
}
