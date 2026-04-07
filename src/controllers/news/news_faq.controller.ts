import { Request, Response, NextFunction } from "express";
import { NewsFaqService } from "../../services/news/news_faq.service";
import { successResponse, errorResponse } from "../../utills/response";

export const listAdminQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const newsId = req.query.news_id ? parseInt(req.query.news_id as string) : undefined;

    const result = await NewsFaqService.listAdminQuestions(page, limit, newsId);

    successResponse(res, result, "News FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await NewsFaqService.listAllQuestions();

    successResponse(res, result, "News FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listQuestionsByNewsId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await NewsFaqService.listQuestionsByNewsId(Number(req.params.newsId));
    return successResponse(res, questions, "News FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await NewsFaqService.getQuestion(Number(req.params.id));
    if (!question) return errorResponse(res, "Question not found", 404);
    return successResponse(res, question);
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await NewsFaqService.createQuestion(req.body);
    return successResponse(res, question, "News FAQ question created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create news FAQ question", 400);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await NewsFaqService.updateQuestion(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Question not found", 404);
    return successResponse(res, null, "News FAQ question updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update news FAQ question", 400);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await NewsFaqService.deleteQuestion(Number(req.params.id));
    return successResponse(res, null, "News FAQ question deleted successfully");
  } catch (err) {
    next(err);
  }
};
