import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import * as CompareService from "../services/compare.service";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || "1"), 10) || 1;
    const limit = parseInt(String(req.query.limit || "10"), 10) || 10;
    const data = await CompareService.listCompareSets(page, limit);
    return successResponse(res, data, "Compare sets fetched successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to fetch compare sets",
      error?.statusCode || 500
    );
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid compare set ID is required", 400);
    }
    const data = await CompareService.getCompareSet(id);
    return successResponse(res, data, "Compare set fetched successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to fetch compare set",
      error?.statusCode || 500
    );
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const data = await CompareService.createCompareSet(req.body);
    return successResponse(res, data, "Compare set created successfully", 201);
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to create compare set",
      error?.statusCode || 400
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid compare set ID is required", 400);
    }
    const data = await CompareService.updateCompareSet(id, req.body);
    return successResponse(res, data, "Compare set updated successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to update compare set",
      error?.statusCode || 400
    );
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid compare set ID is required", 400);
    }
    await CompareService.deleteCompareSet(id);
    return successResponse(res, null, "Compare set deleted successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to delete compare set",
      error?.statusCode || 400
    );
  }
};
