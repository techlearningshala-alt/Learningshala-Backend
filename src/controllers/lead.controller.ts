import { Request, Response } from "express";
import { listLeads, createLead } from "../services/lead.service";
import { successResponse, errorResponse } from "../utills/response";

export const getLeads = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const data = await listLeads(page, limit, { search });
    return successResponse(res, data, "Leads fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching leads:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch leads",
      error?.statusCode || 500
    );
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const lead = await createLead(req.body);
    return successResponse(res, lead, "Lead created successfully", 201);
  } catch (error: any) {
    console.error("❌ Error creating lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to create lead",
      error?.statusCode || 400
    );
  }
};


