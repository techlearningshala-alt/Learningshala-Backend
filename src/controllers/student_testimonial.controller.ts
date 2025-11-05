import { Request, Response, NextFunction } from "express";
import * as TestimonialService from "../services/student_testimonial.service";
import { errorResponse, successResponse } from "../utills/response";
import { createStudentTestimonialSchema } from "../validators/student_testimonials";
import { uploadToS3, deleteFromS3 } from "../config/s3";
import { generateFileName } from "../config/multer";

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

    // Upload to S3
    const fileName = generateFileName(req.file.originalname);
    const thumbnailUrl = await uploadToS3(
      req.file.buffer,
      fileName,
      "student-testimonials",
      req.file.mimetype
    );

    const body = {
      name: req.body.name,
      video_id: req.body.video_id,
      video_title: req.body.video_title,
      thumbnail: thumbnailUrl,
    };

    const validated: any = createStudentTestimonialSchema.parse(body);
    console.log(validated);
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

    // Get current testimonial to delete old thumbnail from S3
    const currentTestimonial: any = await TestimonialService.getTestimonial(Number(req.params.id));

    let thumbnailUrl: string | undefined = existingThumbnail;

    // Upload new file to S3 if provided
    if (req.file) {
      const fileName = generateFileName(req.file.originalname);
      thumbnailUrl = await uploadToS3(
        req.file.buffer,
        fileName,
        "student-testimonials",
        req.file.mimetype
      );

      // Delete old thumbnail from S3 if it exists and is not a local path
      if (currentTestimonial?.thumbnail && typeof currentTestimonial.thumbnail === "string" && !currentTestimonial.thumbnail.startsWith("/uploads/")) {
        await deleteFromS3(currentTestimonial.thumbnail);
      }
    }

    const updates: any = { ...rest };
    if (thumbnailUrl) updates.thumbnail = thumbnailUrl;

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