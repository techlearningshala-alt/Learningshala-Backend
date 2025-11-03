import { NextFunction, Request, Response } from "express";
import * as CourseService from "../../services/courses/course.service";
import { successResponse, errorResponse } from "../../utills/response";
import { createCourseSchema, updateCourseSchema } from "../../validators/courses/domain.validator";
import slugify from "slugify";
import { number } from "zod";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await CourseService.listCourses(page, limit);
    return successResponse(res, result, "Courses fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch courses");
  }
};

export const getCourseName = async (req: Request, res: Response) => {
  try {
    const result = await CourseService.listCoursesName();
    return successResponse(res, result, "Courses name fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch courses name");
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const course = await CourseService.getCourse(Number(req.params.id));
    if (!course) return errorResponse(res, "Course not found", 404);
    return successResponse(res, course, "Course fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch course");
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const body = {
      ...req.body,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : undefined,
    };
    console.log(body,"body")
    body.domain_id = Number(body.domain_id)
    body.priority = Number(body.priority)
    body.menu_visibility = Boolean(body.menu_visibility)
    body.is_active = Boolean(body.is_active)
    const validatedData : any = createCourseSchema.parse(body);
    validatedData.slug = slugify(validatedData.name, { lower: true, strict: true });
    validatedData.thumbnail = validatedData.thumbnail || "/uploads/default-thumbnail.png";

    const course = await CourseService.addCourse(validatedData);
    return successResponse(res, course, "Course created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create course", 400);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { saveWithDate = "true", existingThumbnail, ...rest } = req.body;
    const saveDateFlag = saveWithDate === "true";
    console.log(existingThumbnail, "validated course data");

    // Convert types properly before validation
    const parsedData: any = {
      ...rest,
      domain_id: rest.domain_id ? Number(rest.domain_id) : null,
      priority: rest.priority ? Number(rest.priority) : 0,
      is_active: rest.is_active === "true" || rest.is_active === true || rest.is_active === 1,
      menu_visibility: rest.menu_visibility === "true" || rest.menu_visibility === true || rest.menu_visibility === 1,
    };
  // const thumbnail = req.file ? `/uploads/${req.file.filename}` : existingThumbnail;

  //   const updates: any = { ...rest };
  //   if (thumbnail) updates.thumbnail = thumbnail;

    // Handle thumbnail (new or existing)
    parsedData.thumbnail = req.file
      ? `/uploads/${req.file.filename}`
      : existingThumbnail;

    // Validate using Zod schema
    const validatedData: any = updateCourseSchema.parse(parsedData);

    // Generate slug if name provided
    if (validatedData.name) {
      validatedData.slug = slugify(validatedData.name, { lower: true, strict: true });
    }

    // Update in DB
    const course = await CourseService.updateCourse(Number(req.params.id), validatedData, saveDateFlag);
    if (!course) return errorResponse(res, "Course not found or nothing to update", 404);

    return successResponse(res, course, "Course updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update course", 400);
  }
};


export const remove = async (req: Request, res: Response) => {
  try {
    const result = await CourseService.deleteCourse(Number(req.params.id));
    return successResponse(res, result, "Course deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to delete course", 400);
  }
};
