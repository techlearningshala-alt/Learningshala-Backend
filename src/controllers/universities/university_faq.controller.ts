import { Request, Response, NextFunction } from "express";
import { UniversityFaqService } from "../../services/universities/university_faq.service";
import { successResponse, errorResponse } from "../../utills/response";

// -------- Categories --------

export const listAdminQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const universityId = req.query.university_id ? parseInt(req.query.university_id as string) : undefined;
    const categoryId = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;

    const result = await UniversityFaqService.listAdminQuestions(page, limit, universityId, categoryId);

    // Use your existing successResponse
    successResponse(res, result, "University FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UniversityFaqService.listAllQuestions();

    // Use your existing successResponse
    successResponse(res, result, "University FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await UniversityFaqService.listCategories(page, limit);

    // Calculate total pages
    const pages = Math.ceil(result.total / limit);

    return successResponse(res, {
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages,
    }, "University FAQ categories fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await UniversityFaqService.getCategory(Number(req.params.id));
    if (!category) return errorResponse(res, "Category not found", 404);
    return successResponse(res, category);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await UniversityFaqService.createCategory(req.body);
    return successResponse(res, category, "University FAQ category created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await UniversityFaqService.updateCategory(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Category not found", 404);
    return successResponse(res, null, "University FAQ category updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await UniversityFaqService.deleteCategory(Number(req.params.id));
    return successResponse(res, null, "University FAQ category deleted successfully");
  } catch (err) {
    next(err);
  }
};

// -------- Questions --------
export const listQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await UniversityFaqService.listQuestions(Number(req.params.categoryId));
    return successResponse(res, questions, "University FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await UniversityFaqService.getQuestion(Number(req.params.id));
    if (!question) return errorResponse(res, "Question not found", 404);
    return successResponse(res, question);
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await UniversityFaqService.createQuestion(req.body);
    return successResponse(res, question, "University FAQ question created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await UniversityFaqService.updateQuestion(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Question not found", 404);
    return successResponse(res, null, "University FAQ question updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await UniversityFaqService.deleteQuestion(Number(req.params.id));
    return successResponse(res, null, "University FAQ question deleted successfully");
  } catch (err) {
    next(err);
  }
};

