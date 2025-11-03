import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utills/response";
import * as PlacementPartnerService from "../../services/universities/placement-partner.service";

/**
 * Create new placement partner
 */
export const create = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    const file = req.file;

    // Handle logo upload
    if (file) {
      body.logo = `/uploads/${file.filename}`;
    }

    const newPartner = await PlacementPartnerService.createPlacementPartner(body);
    return successResponse(res, newPartner, "Placement partner created successfully");
  } catch (error: any) {
    console.error("❌ Error creating placement partner:", error);
    return errorResponse(res, error.message || "Failed to create placement partner", 500);
  }
};

/**
 * Update placement partner
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    const file = req.file;

    // Handle logo upload (if new logo provided)
    if (file) {
      body.logo = `/uploads/${file.filename}`;
    }

    const updatedPartner = await PlacementPartnerService.updatePlacementPartner(
      parseInt(id, 10),
      body
    );

    if (!updatedPartner) {
      return errorResponse(res, "Placement partner not found", 404);
    }

    return successResponse(res, updatedPartner, "Placement partner updated successfully");
  } catch (error: any) {
    console.error("❌ Error updating placement partner:", error);
    return errorResponse(res, error.message || "Failed to update placement partner", 500);
  }
};

/**
 * Get all placement partners (with pagination)
 */
export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await PlacementPartnerService.getAllPlacementPartners(page, limit);
    return successResponse(res, result, "Placement partners fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching placement partners:", error);
    return errorResponse(res, error.message || "Failed to fetch placement partners", 500);
  }
};

/**
 * Get single placement partner
 */
export const findOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const partner = await PlacementPartnerService.getPlacementPartnerById(
      parseInt(id, 10)
    );

    if (!partner) {
      return errorResponse(res, "Placement partner not found", 404);
    }

    return successResponse(res, partner, "Placement partner fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching placement partner:", error);
    return errorResponse(res, error.message || "Failed to fetch placement partner", 500);
  }
};

/**
 * Delete placement partner
 */
export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await PlacementPartnerService.deletePlacementPartner(
      parseInt(id, 10)
    );

    if (!deleted) {
      return errorResponse(res, "Placement partner not found", 404);
    }

    return successResponse(res, null, "Placement partner deleted successfully");
  } catch (error: any) {
    console.error("❌ Error deleting placement partner:", error);
    return errorResponse(res, error.message || "Failed to delete placement partner", 500);
  }
};

