import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import { createWebsiteLead } from "../services/website_lead.service";

export const create = async (req: Request, res: Response) => {
  try {
    const lead = await createWebsiteLead(req.body);
    return successResponse(res, lead, "Website lead created successfully", 201);
  } catch (error: any) {
    console.error("❌ Error creating website lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to create website lead",
      error?.statusCode || 400
    );
  }
};

