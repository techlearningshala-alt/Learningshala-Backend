import { Request, Response } from "express";
import { listLeads, createLead, updateLeadByPhoneOrEmail, getLeadByPhone } from "../services/lead.service";
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

export const getByPhone = async (req: Request, res: Response) => {
  try {
    const phone = req.query.phone as string;
    if (!phone) {
      return errorResponse(res, "Phone number is required", 400);
    }
    const lead = await getLeadByPhone(phone);
    return successResponse(res, lead, "Lead fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching lead by phone:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch lead",
      error?.statusCode || 404
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

export const update = async (req: Request, res: Response) => {
  try {
    const lead = await updateLeadByPhoneOrEmail(req.body);
    return successResponse(res, lead, "Lead updated successfully");
  } catch (error: any) {
    console.error("❌ Error updating lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to update lead",
      error?.statusCode || 400
    );
  }
};


