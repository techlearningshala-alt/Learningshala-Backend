import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import { createPartnerWithUs } from "../services/partner_with_us.service";

export const create = async (req: Request, res: Response) => {
  try {
    const entry = await createPartnerWithUs(req.body);
    return successResponse(
      res,
      entry,
      "Partner submission saved successfully",
      201
    );
  } catch (error: any) {
    console.error("❌ Error creating partner with us entry:", error);
    return errorResponse(
      res,
      error?.message || "Failed to submit partner form",
      error?.statusCode || 400
    );
  }
};
