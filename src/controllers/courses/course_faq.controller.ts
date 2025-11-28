import { Request, Response, NextFunction } from "express";
import { CourseFaqService } from "../../services/courses/course_faq.service";
import { successResponse, errorResponse } from "../../utills/response";

// -------- Categories --------

export const listAdminQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const courseId = req.query.course_id ? parseInt(req.query.course_id as string) : undefined;
    const categoryId = req.query.category_id ? parseInt(req.query.category_id as string) : undefined;

    const result = await CourseFaqService.listAdminQuestions(page, limit, courseId, categoryId);

    successResponse(res, result, "Course FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CourseFaqService.listAllQuestions();

    successResponse(res, result, "Course FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await CourseFaqService.listCategories(page, limit);

    // Calculate total pages
    const pages = Math.ceil(result.total / limit);

    return successResponse(res, {
      data: result.data,
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages,
    }, "Course FAQ categories fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await CourseFaqService.getCategory(Number(req.params.id));
    if (!category) return errorResponse(res, "Category not found", 404);
    return successResponse(res, category);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await CourseFaqService.createCategory(req.body);
    return successResponse(res, category, "Course FAQ category created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await CourseFaqService.updateCategory(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Category not found", 404);
    return successResponse(res, null, "Course FAQ category updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await CourseFaqService.deleteCategory(Number(req.params.id));
    return successResponse(res, null, "Course FAQ category deleted successfully");
  } catch (err) {
    next(err);
  }
};

// -------- Questions --------
export const listQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questions = await CourseFaqService.listQuestions(Number(req.params.categoryId));
    return successResponse(res, questions, "Course FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const listQuestionsByCourseId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = Number(req.params.courseId);
    const questions = await CourseFaqService.listQuestionsByCourseId(courseId);
    return successResponse(res, questions, "Course FAQ questions fetched successfully");
  } catch (err) {
    next(err);
  }
};

export const getQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await CourseFaqService.getQuestion(Number(req.params.id));
    if (!question) return errorResponse(res, "Question not found", 404);
    return successResponse(res, question);
  } catch (err) {
    next(err);
  }
};

export const createQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await CourseFaqService.createQuestion(req.body);
    return successResponse(res, question, "Course FAQ question created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await CourseFaqService.updateQuestion(Number(req.params.id), req.body);
    if (!updated) return errorResponse(res, "Question not found", 404);
    return successResponse(res, null, "Course FAQ question updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteQuestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await CourseFaqService.deleteQuestion(Number(req.params.id));
    return successResponse(res, null, "Course FAQ question deleted successfully");
  } catch (err) {
    next(err);
  }
};

