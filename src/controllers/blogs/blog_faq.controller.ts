import { Request, Response, NextFunction } from "express";
import { BlogFaqService } from "../../services/blogs/blog_faq.service";
import { successResponse, errorResponse } from "../../utills/response";

// -------- Categories --------

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await BlogFaqService.listCategories(page, limit);

    // Calculate total pages
    const pages = Math.ceil(result.total / limit);

    return successResponse(res, {
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages,
    }, "Blog FAQ categories fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await BlogFaqService.getCategory(Number(req.params.id));
    if (!category) return errorResponse(res, "Category not found", 404);
    return successResponse(res, category);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await BlogFaqService.createCategory(req.body);
    return successResponse(res, category, "Blog FAQ category created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await BlogFaqService.updateCategory(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Category not found", 404);
    return successResponse(res, null, "Blog FAQ category updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await BlogFaqService.deleteCategory(Number(req.params.id));
    return successResponse(res, null, "Blog FAQ category deleted successfully");
  } catch (err) {
    next(err);
  }
};

// -------- Questions --------
export const listAdminQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const blogId = req.query.blog_id ? parseInt(req.query.blog_id as string) : undefined;
    const categoryId = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;

    const result = await BlogFaqService.listAdminQuestions(page, limit, blogId, categoryId);

    successResponse(res, result, "Blog FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BlogFaqService.listAllQuestions();

    successResponse(res, result, "Blog FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await BlogFaqService.listQuestions(Number(req.params.categoryId));
    return successResponse(res, questions, "Blog FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listQuestionsByBlogId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await BlogFaqService.listQuestionsByBlogId(Number(req.params.blogId));
    return successResponse(res, questions, "Blog FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await BlogFaqService.getQuestion(Number(req.params.id));
    if (!question) return errorResponse(res, "Question not found", 404);
    return successResponse(res, question);
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await BlogFaqService.createQuestion(req.body);
    return successResponse(res, question, "Blog FAQ question created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create blog FAQ question", 400);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await BlogFaqService.updateQuestion(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Question not found", 404);
    return successResponse(res, null, "Blog FAQ question updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update blog FAQ question", 400);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await BlogFaqService.deleteQuestion(Number(req.params.id));
    return successResponse(res, null, "Blog FAQ question deleted successfully");
  } catch (err) {
    next(err);
  }
};
