import { Request, Response, NextFunction } from "express";
import { UniversityCourseSpecializationFaqService } from "../../services/universities/university_course_specialization_faq.service";
import { successResponse, errorResponse } from "../../utills/response";

// -------- Questions --------
export const listAdminQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const specializationId = req.query.specialization_id ? parseInt(req.query.specialization_id as string) : undefined;
    const categoryId = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;

    const result = await UniversityCourseSpecializationFaqService.listAdminQuestions(page, limit, specializationId, categoryId);

    // Use your existing successResponse
    successResponse(res, result, "University course specialization FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UniversityCourseSpecializationFaqService.listAllQuestions();

    // Use your existing successResponse
    successResponse(res, result, "University course specialization FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await UniversityCourseSpecializationFaqService.listQuestions(Number(req.params.categoryId));
    return successResponse(res, questions, "University course specialization FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await UniversityCourseSpecializationFaqService.getQuestion(Number(req.params.id));
    if (!question) return errorResponse(res, "Question not found", 404);
    return successResponse(res, question);
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await UniversityCourseSpecializationFaqService.createQuestion(req.body);
    return successResponse(res, question, "University course specialization FAQ question created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await UniversityCourseSpecializationFaqService.updateQuestion(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Question not found", 404);
    return successResponse(res, null, "University course specialization FAQ question updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await UniversityCourseSpecializationFaqService.deleteQuestion(Number(req.params.id));
    return successResponse(res, null, "University course specialization FAQ question deleted successfully");
  } catch (err) {
    next(err);
  }
};

