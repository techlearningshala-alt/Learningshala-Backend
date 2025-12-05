import { Request, Response, NextFunction } from "express";
import { SpecializationFaqService } from "../../services/courses/specialization_faq.service";
import { successResponse, errorResponse } from "../../utills/response";

export const listQuestionsBySpecializationId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const specializationId = Number(req.params.specializationId);
    const questions = await SpecializationFaqService.listQuestionsBySpecializationId(specializationId);
    return successResponse(res, questions, "Specialization FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await SpecializationFaqService.getQuestion(Number(req.params.id));
    if (!question) return errorResponse(res, "Question not found", 404);
    return successResponse(res, question);
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await SpecializationFaqService.createQuestion(req.body);
    return successResponse(res, question, "Specialization FAQ question created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await SpecializationFaqService.updateQuestion(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Question not found", 404);
    return successResponse(res, null, "Specialization FAQ question updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await SpecializationFaqService.deleteQuestion(Number(req.params.id));
    return successResponse(res, null, "Specialization FAQ question deleted successfully");
  } catch (err) {
    next(err);
  }
};

