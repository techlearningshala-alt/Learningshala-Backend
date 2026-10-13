import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import * as WebsiteLeadAuthService from "../services/website_lead_auth.service";

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;
    const data = await WebsiteLeadAuthService.verifyOtpAndLogin(phone, otp);
    return successResponse(res, data, "Login successful");
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "OTP verification failed",
      error?.statusCode || 400
    );
  }
};
