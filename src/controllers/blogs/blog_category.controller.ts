import { Request, Response, NextFunction } from "express";
import { BlogCategoryService } from "../../services/blogs/blog_category.service";
import { successResponse, errorResponse } from "../../utills/response";

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await BlogCategoryService.list(page, limit);

    // Calculate total pages
    const pages = Math.ceil(result.total / limit);

    return successResponse(res, {
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages,
    }, "Blog categories fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await BlogCategoryService.get(Number(req.params.id));
    if (!category) return errorResponse(res, "Blog category not found", 404);
    return successResponse(res, category, "Blog category fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await BlogCategoryService.create(req.body);
    return successResponse(res, category, "Blog category created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create blog category", 400);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await BlogCategoryService.update(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Blog category not found", 404);
    return successResponse(res, null, "Blog category updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update blog category", 400);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await BlogCategoryService.delete(Number(req.params.id));
    return successResponse(res, null, "Blog category deleted successfully");
  } catch (err) {
    next(err);
  }
};
