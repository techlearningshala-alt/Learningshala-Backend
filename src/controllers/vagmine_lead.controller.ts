import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import { createVagmineLead } from "../services/vagmine_lead.service";

export const create = async (req: Request, res: Response) => {
  try {
    const lead = await createVagmineLead(req.body);
    return successResponse(
      res,
      lead,
      "Vagmine lead created successfully",
      201
    );
  } catch (error: any) {
    console.error("❌ Error creating vagmine lead:", error);
    return errorResponse(
      res,
      error?.message || "Failed to create vagmine lead",
      error?.statusCode || 400
    );
  }
};
