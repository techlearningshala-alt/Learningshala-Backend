import { Request, Response } from "express";
import { listLeads, createLead, updateLeadByPhone, getLeadByPhone } from "../../services/leads/lead.service";
import { successResponse, errorResponse } from "../../utills/response";

export const getLeads = async (req: Request, res: Response) => {
  try {
    // Check if phone parameter is provided - if so, fetch by phone instead
    const phone = req.query.phone as string;
    console.log(phone,"phone")
    console.log(typeof phone,"typeof phone")
    if (phone) {
      const leads = await getLeadByPhone(phone);
      return successResponse(res, leads, "Leads fetched successfully");
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const fromDate =
      typeof req.query.fromDate === "string" ? req.query.fromDate.trim() : undefined;
    const toDate =
      typeof req.query.toDate === "string" ? req.query.toDate.trim() : undefined;

    const data = await listLeads(page, limit, { search, fromDate, toDate });
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

export const update = async (req: Request, res: Response) => {
  try {
    const lead = await updateLeadByPhone(req.body);
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

