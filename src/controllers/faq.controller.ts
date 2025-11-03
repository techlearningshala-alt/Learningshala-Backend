import { Request, Response, NextFunction } from "express";
import { FaqService } from "../services/faq.service";
import { successResponse, errorResponse } from "../utills/response";

// -------- Categories --------

export const listAdminQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await FaqService.listAdminQuestions(page, limit);

    // Use your existing successResponse
    successResponse(res, result, "Questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const result = await FaqService.listAllQuestions();

    // Use your existing successResponse
    successResponse(res, result, "Questions fetched successfully");
  } catch (err) {
    next(err);
  }
};


export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await FaqService.listCategories(page, limit);

    // Calculate total pages
    const pages = Math.ceil(result.total / limit);

    return successResponse(res, {
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages,
    }, "Categories fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await FaqService.getCategory(Number(req.params.id));
    if (!category) return errorResponse(res, "Category not found", 404);
    return successResponse(res, category);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await FaqService.createCategory(req.body);
    return successResponse(res, category, "Category created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await FaqService.updateCategory(Number(req.params.id), req.body);
    console.log(req.body, "req.body")
    if (!updated) return errorResponse(res, "Category not found", 404);
    return successResponse(res, null, "Category updated successfully");
  } catch (err) {
    next(err);
  }
};


export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await FaqService.deleteCategory(Number(req.params.id));
    return successResponse(res, null, "Category deleted successfully");
  } catch (err) {
    next(err);
  }
};

// -------- Questions --------
export const listQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("coming")
    const questions = await FaqService.listQuestions(Number(req.params.categoryId));
    console.log(questions, "ques")
    return successResponse(res, questions, "Questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await FaqService.getQuestion(Number(req.params.id));
    if (!question) return errorResponse(res, "Question not found", 404);
    return successResponse(res, question);
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await FaqService.createQuestion(req.body);
    return successResponse(res, question, "Question created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await FaqService.updateQuestion(Number(req.params.id), req.body);
    console.log(req.body, "req.bodyyyyy")
    if (!updated) return errorResponse(res, "Question not found", 404);
    return successResponse(res, null, "Question updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await FaqService.deleteQuestion(Number(req.params.id));
    return successResponse(res, null, "Question deleted successfully");
  } catch (err) {
    next(err);
  }
};
