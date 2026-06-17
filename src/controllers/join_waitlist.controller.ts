import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import { createJoinWaitlist } from "../services/join_waitlist.service";

export const create = async (req: Request, res: Response) => {
  try {
    const entry = await createJoinWaitlist(req.body);
    return successResponse(
      res,
      entry,
      "Waitlist submission saved successfully",
      201
    );
  } catch (error: any) {
    console.error("❌ Error creating join waitlist entry:", error);
    return errorResponse(
      res,
      error?.message || "Failed to submit waitlist form",
      error?.statusCode || 400
    );
  }
};
