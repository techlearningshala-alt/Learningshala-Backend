import { Request, Response, NextFunction } from "express";

const EXTERNAL_FORMS_API_KEY = process.env.EXTERNAL_FORMS_API_KEY || "";

/**
 * Protects public form APIs used by external web apps.
 * Expects: X-API-Key: <EXTERNAL_FORMS_API_KEY>
 */
export const externalFormsApiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!EXTERNAL_FORMS_API_KEY) {
    console.error("❌ EXTERNAL_FORMS_API_KEY is not configured");
    return res.status(500).json({
      success: false,
      message: "External forms API is not configured",
    });
  }

  const apiKey =
    (typeof req.headers["x-api-key"] === "string" && req.headers["x-api-key"]) ||
    (typeof req.headers["x-api-key"] === "object" && req.headers["x-api-key"]?.[0]) ||
    "";

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key is required (X-API-Key header)",
    });
  }

  if (apiKey !== EXTERNAL_FORMS_API_KEY) {
    return res.status(403).json({
      success: false,
      message: "Invalid API key",
    });
  }

  return next();
};
