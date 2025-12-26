import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utills/response";
import { createWebsiteLead, verifyWebsiteLeadOtp, listWebsiteLeads } from "../../services/website_leads/website_lead.service";
import { authMiddleware } from "../../middlewares/auth.middleware";

export const create = async (req: Request, res: Response) => {
  try {
    const lead = await createWebsiteLead(req.body);
    // Exclude OTP from response for security
    const { otp, ...leadWithoutOtp } = lead;
    return successResponse(res, leadWithoutOtp, "Website lead created successfully", 201);
  } catch (error: any) {
    console.error("❌ Error creating website lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to create website lead",
      error?.statusCode || 400
    );
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const fromDate =
      typeof req.query.fromDate === "string" ? req.query.fromDate.trim() : undefined;
    const toDate =
      typeof req.query.toDate === "string" ? req.query.toDate.trim() : undefined;

    const data = await listWebsiteLeads(page, limit, { search, fromDate, toDate });
    return successResponse(res, data, "Website leads fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching website leads:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch website leads",
      error?.statusCode || 500
    );
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { otp } = req.body;

    if (!id || isNaN(id)) {
      return errorResponse(res, "Valid lead ID is required", 400);
    }

    if (!otp || typeof otp !== "string" || !/^\d{6}$/.test(otp.trim())) {
      return errorResponse(res, "OTP must be exactly 6 digits", 400);
    }

    const isValid = await verifyWebsiteLeadOtp(id, otp);

    if (isValid) {
      return successResponse(res, { verified: true }, "OTP verified successfully");
    } else {
      return errorResponse(res, "Invalid OTP or lead ID", 400);
    }
  } catch (error: any) {
    console.error("❌ Error verifying OTP:", error);
    return errorResponse(
      res,
      error?.message || "Failed to verify OTP",
      error?.statusCode || 400
    );
  }
};

