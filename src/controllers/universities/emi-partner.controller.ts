import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utills/response";
import * as EmiPartnerService from "../../services/universities/emi-partner.service";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";

/**
 * Create new EMI partner
 */
export const create = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    const file = req.file;

    // Upload to S3 if file exists
    if (file) {
      const fileName = generateFileName(file.originalname);
      body.logo = await uploadToS3(
        file.buffer,
        fileName,
        "emi-partners",
        file.mimetype
      );
    }

    const newPartner = await EmiPartnerService.createEmiPartner(body);
    return successResponse(res, newPartner, "EMI partner created successfully");
  } catch (error: any) {
    console.error("❌ Error creating EMI partner:", error);
    return errorResponse(res, error.message || "Failed to create EMI partner", 500);
  }
};

/**
 * Update EMI partner
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { existingLogo, ...rest } = req.body;
    const file = req.file;

    // Get current partner to delete old logo from S3
    const currentPartner: any = await EmiPartnerService.getEmiPartnerById(parseInt(id, 10));

    let logoUrl: string | undefined = existingLogo;

    // Upload new file to S3 if provided
    if (file) {
      const fileName = generateFileName(file.originalname);
      logoUrl = await uploadToS3(
        file.buffer,
        fileName,
        "emi-partners",
        file.mimetype
      );

      // Delete old logo from S3 if it exists and is not a local path
      if (currentPartner?.logo && typeof currentPartner.logo === "string" && !currentPartner.logo.startsWith("/uploads/")) {
        await deleteFromS3(currentPartner.logo);
      }
    }

    const body = {
      ...rest,
      logo: logoUrl,
    };

    const updatedPartner = await EmiPartnerService.updateEmiPartner(
      parseInt(id, 10),
      body
    );

    if (!updatedPartner) {
      return errorResponse(res, "EMI partner not found", 404);
    }

    return successResponse(res, updatedPartner, "EMI partner updated successfully");
  } catch (error: any) {
    console.error("❌ Error updating EMI partner:", error);
    return errorResponse(res, error.message || "Failed to update EMI partner", 500);
  }
};

/**
 * Get all EMI partners (with pagination)
 */
export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await EmiPartnerService.getAllEmiPartners(page, limit);
    return successResponse(res, result, "EMI partners fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching EMI partners:", error);
    return errorResponse(res, error.message || "Failed to fetch EMI partners", 500);
  }
};

/**
 * Get single EMI partner
 */
export const findOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = await EmiPartnerService.getEmiPartnerById(
      parseInt(id, 10)
    );

    if (!partner) {
      return errorResponse(res, "EMI partner not found", 404);
    }

    return successResponse(res, partner, "EMI partner fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching EMI partner:", error);
    return errorResponse(res, error.message || "Failed to fetch EMI partner", 500);
  }
};

/**
 * Delete EMI partner
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await EmiPartnerService.deleteEmiPartner(parseInt(id, 10));
    return successResponse(res, null, "EMI partner deleted successfully");
  } catch (error: any) {
    console.error("❌ Error deleting EMI partner:", error);
    return errorResponse(res, error.message || "Failed to delete EMI partner", 500);
  }
};

