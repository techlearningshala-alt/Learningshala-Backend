import { Request, Response, NextFunction } from "express";
import { BlogFaqService } from "../../services/blogs/blog_faq.service";
import { successResponse, errorResponse } from "../../utills/response";

// -------- Questions --------
export const listAdminQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const blogId = req.query.blog_id ? parseInt(req.query.blog_id as string) : undefined;

    const result = await BlogFaqService.listAdminQuestions(page, limit, blogId);

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
