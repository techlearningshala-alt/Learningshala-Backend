import { Request, Response, NextFunction } from "express";
import { UniversityTypesService } from "../../services/universities/university_types.service";
import { successResponse, errorResponse } from "../../utills/response";

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await UniversityTypesService.list(page, limit);

    // Calculate total pages
    const pages = Math.ceil(result.total / limit);

    return successResponse(res, {
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages,
    }, "University types fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = await UniversityTypesService.get(Number(req.params.id));
    if (!type) return errorResponse(res, "University type not found", 404);
    return successResponse(res, type);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = await UniversityTypesService.create(req.body);
    return successResponse(res, type, "University type created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await UniversityTypesService.update(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "University type not found", 404);
    return successResponse(res, null, "University type updated successfully");
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await UniversityTypesService.delete(Number(req.params.id));
    return successResponse(res, null, "University type deleted successfully");
  } catch (err) {
    next(err);
  }
};

