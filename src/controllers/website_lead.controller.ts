import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import { createWebsiteLead, verifyWebsiteLeadOtp } from "../services/website_lead.service";

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

