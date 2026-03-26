import { Request, Response } from "express";
import * as RedirectionService from "../../services/redirections/redirection.service";
import {
  createRedirectionSchema,
  updateRedirectionSchema,
} from "../../validators/redirections/redirection.validator";
import { successResponse, errorResponse } from "../../utills/response";
import { buildOldUrlLookupKeysFromHref } from "../../utills/redirectionLookup";

/** Public (no auth): used by Next.js edge / CDN to resolve 301 targets for a full URL. */
export const resolvePublic = async (req: Request, res: Response) => {
  try {
    const urlParam = (req.query.url as string | undefined)?.trim();
    if (!urlParam) {
      return errorResponse(res, "Query parameter url is required (full URL, e.g. https://learningshala.com/old-path)", 400);
    }
    let parsed: URL;
    try {
      parsed = new URL(urlParam);
    } catch {
      return errorResponse(res, "Invalid url", 400);
    }
    const hostname = parsed.hostname;
    const originalUrl = parsed.pathname + parsed.search;
    const keys = buildOldUrlLookupKeysFromHref(urlParam);
    const match = await RedirectionService.resolveRedirectForRequest(hostname, originalUrl, keys);
    if (!match?.new_url) {
      return errorResponse(res, "No redirect configured for this URL", 404);
    }
    return successResponse(res, { new_url: match.new_url }, "Redirect found");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to resolve redirect");
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string | undefined;
    const result = await RedirectionService.listRedirections(page, limit, search);
    return successResponse(res, result, "Redirections fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch redirections");
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const redirection = await RedirectionService.getRedirection(id);
    if (!redirection) return errorResponse(res, "Redirection not found", 404);
    return successResponse(res, redirection, "Redirection fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch redirection");
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createRedirectionSchema.parse(req.body);
    
    // Check if old_url already exists
    const existing = await RedirectionService.getRedirectionByOldUrl(validatedData.old_url);
    if (existing) {
      return errorResponse(res, "A redirection with this old URL already exists", 400);
    }

    const redirection = await RedirectionService.addRedirection(validatedData);
    return successResponse(res, redirection, "Redirection created successfully", 201);
  } catch (err: any) {
    if (err.name === "ZodError") {
      return errorResponse(res, err.errors[0].message, 400);
    }
    return errorResponse(res, err.message || "Failed to create redirection", 400);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existingRedirection = await RedirectionService.getRedirection(id);
    if (!existingRedirection) {
      return errorResponse(res, "Redirection not found", 404);
    }

    const validatedData = updateRedirectionSchema.parse(req.body);
    
    // If old_url is being updated, check if it already exists
    if (validatedData.old_url && validatedData.old_url !== existingRedirection.old_url) {
      const existing = await RedirectionService.getRedirectionByOldUrl(validatedData.old_url);
      if (existing) {
        return errorResponse(res, "A redirection with this old URL already exists", 400);
      }
    }

    const redirection = await RedirectionService.updateRedirection(id, validatedData);
    return successResponse(res, redirection, "Redirection updated successfully");
  } catch (err: any) {
    if (err.name === "ZodError") {
      return errorResponse(res, err.errors[0].message, 400);
    }
    return errorResponse(res, err.message || "Failed to update redirection", 400);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await RedirectionService.deleteRedirection(id);
    if (!deleted) {
      return errorResponse(res, "Redirection not found", 404);
    }
    return successResponse(res, null, "Redirection deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to delete redirection");
  }
};
