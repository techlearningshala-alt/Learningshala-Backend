import { Request, Response, NextFunction } from "express";
import * as TestimonialService from "../services/student_testimonial.service";
import { errorResponse, successResponse } from "../utills/response";
import { createStudentTestimonialSchema } from "../validators/student_testimonials";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await TestimonialService.listTestimonials(page, limit);
    return successResponse(res, result, "Fetched student testimonials successfully");
  } catch (err) {
    return errorResponse(res, "Failed to fetch testimonials");
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await TestimonialService.getTestimonial(Number(req.params.id));
    return successResponse(res, data, "Fetched testimonial successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Testimonial not found", err.statusCode || 404);
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return errorResponse(res, "Thumbnail is required", 400);
    }

    const body = {
      name: req.body.name,
      video_id: req.body.video_id,
      video_title: req.body.video_title,
      thumbnail: `/uploads/${req.file.filename}`,
    };

    const validated : any= createStudentTestimonialSchema.parse(body);
    console.log(validated)
    const result = await TestimonialService.addTestimonial(validated);

    return successResponse(res, result, "Student testimonial created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Validation failed", 400);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { saveWithDate = "true", existingThumbnail, ...rest } = req.body;
    const saveDateFlag = saveWithDate === "true";
    const thumbnail = req.file ? `/uploads/${req.file.filename}` : existingThumbnail;

    const updates: any = { ...rest };
    if (thumbnail) updates.thumbnail = thumbnail;

    const result = await TestimonialService.updateTestimonial(Number(req.params.id), updates, saveDateFlag);
     return successResponse(res, result, "Student testimonial updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Update failed", err.statusCode || 400);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await TestimonialService.deleteTestimonial(Number(req.params.id));
    return successResponse(res, result, "Student testimonial deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Delete failed", err.statusCode || 404);
  }
};