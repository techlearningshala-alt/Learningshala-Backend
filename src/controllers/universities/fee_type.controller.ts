import { Request, Response } from "express";
import {
  listFeeTypes,
  getFeeTypeById,
  createFeeType,
  updateFeeType,
  deleteFeeType,
} from "../../services/universities/fee_type.service";
import { successResponse, errorResponse } from "../../utills/response";

export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const result = await listFeeTypes(page, limit, { search });
    return successResponse(res, result, "Fee types fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching fee types:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch fee types",
      error.statusCode || 500
    );
  }
};

export const findOne = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const feeType = await getFeeTypeById(id);

    if (!feeType) {
      return errorResponse(res, "Fee type not found", 404);
    }

    return successResponse(res, feeType, "Fee type fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching fee type:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch fee type",
      error.statusCode || 500
    );
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const feeType = await createFeeType(req.body);
    return successResponse(res, feeType, "Fee type created successfully", 201);
  } catch (error: any) {
    console.error("❌ Error creating fee type:", error);
    return errorResponse(
      res,
      error.message || "Failed to create fee type",
      error.statusCode || 400
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await getFeeTypeById(id);

    if (!existing) {
      return errorResponse(res, "Fee type not found", 404);
    }

    const feeType = await updateFeeType(id, req.body);
    return successResponse(res, feeType, "Fee type updated successfully");
  } catch (error: any) {
    console.error("❌ Error updating fee type:", error);
    return errorResponse(
      res,
      error.message || "Failed to update fee type",
      error.statusCode || 400
    );
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteFeeType(id);

    if (!deleted) {
      return errorResponse(res, "Fee type not found", 404);
    }

    return successResponse(res, null, "Fee type deleted successfully");
  } catch (error: any) {
    console.error("❌ Error deleting fee type:", error);
    return errorResponse(
      res,
      error.message || "Failed to delete fee type",
      error.statusCode || 400
    );
  }
};


