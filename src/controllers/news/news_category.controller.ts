import { Request, Response, NextFunction } from "express";
import { NewsCategoryService } from "../../services/news/news_category.service";
import { successResponse, errorResponse } from "../../utills/response";

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await NewsCategoryService.list(page, limit);

    const pages = Math.ceil(result.total / limit);

    return successResponse(
      res,
      {
        data: result.data,
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages,
      },
      "News categories fetched successfully"
    );
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await NewsCategoryService.get(Number(req.params.id));
    if (!category) return errorResponse(res, "News category not found", 404);
    return successResponse(res, category, "News category fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await NewsCategoryService.create(req.body);
    return successResponse(res, category, "News category created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create news category", 400);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await NewsCategoryService.update(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "News category not found", 404);
    return successResponse(res, null, "News category updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update news category", 400);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await NewsCategoryService.delete(Number(req.params.id));
    return successResponse(res, null, "News category deleted successfully");
  } catch (err) {
    next(err);
  }
};

export const toggleVisibility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const visible =
      req.body.visible === true ||
      req.body.visible === "true" ||
      req.body.visible === "yes" ||
      req.body.visible === 1;

    const category = await NewsCategoryService.toggleVisibility(id, visible);
    if (!category) {
      return errorResponse(res, "News category not found", 404);
    }

    return successResponse(res, category, "Category visibility updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update category visibility", 400);
  }
};
