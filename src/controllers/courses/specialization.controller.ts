import { Request, Response } from "express";
import * as SpecializationService from "../../services/courses/specialization.service";
import { successResponse, errorResponse } from "../../utills/response";
import { createSpecializationSchema, updateSpecializationSchema } from "../../validators/courses/domain.validator";
import slugify from "slugify";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await SpecializationService.listSpecializations(page, limit);
    return successResponse(res, result, "Specializations fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch specializations");
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const specialization = await SpecializationService.getSpecialization(Number(req.params.id));
    if (!specialization) return errorResponse(res, "Specialization not found", 404);
    return successResponse(res, specialization, "Specialization fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch specialization");
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const body = {
      ...req.body,
      thumbnail: req.file ? `/uploads/${req.file.filename}` : undefined,
    };

    const toBoolean = (val: any) => val === "true" || val === true;

    body.course_id = Number(body.course_id);
    body.priority = Number(body.priority);
    body.menu_visibility = toBoolean(body.menu_visibility);
    body.is_active = toBoolean(body.is_active);

    const validatedData: any = createSpecializationSchema.parse(body);
    validatedData.slug = slugify(validatedData.name, { lower: true, strict: true });
    validatedData.thumbnail = validatedData.thumbnail || "/uploads/default-thumbnail.png";

    const specialization = await SpecializationService.addSpecialization(validatedData);
    return successResponse(res, specialization, "Specialization created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create specialization", 400);
  }
};


export const update = async (req: Request, res: Response) => {
  try {
    const { saveWithDate = "true", existingThumbnail, ...rest } = req.body;

    const parsedData: any = {
      ...rest,
      course_id: rest.course_id ? Number(rest.course_id) : null,
      priority: rest.priority ? Number(rest.priority) : 0,
      is_active: rest.is_active === "true" || rest.is_active === true || rest.is_active === 1,
      menu_visibility: rest.menu_visibility === "true" || rest.menu_visibility === true || rest.menu_visibility === 1,
    };
    parsedData.thumbnail = req.file
      ? `/uploads/${req.file.filename}`
      : existingThumbnail;
    const saveDateFlag = saveWithDate === "true";


    const validatedData : any = updateSpecializationSchema.parse(parsedData);

    if (validatedData.name) {
      validatedData.slug = slugify(validatedData.name, { lower: true, strict: true });
    }

    const specialization = await SpecializationService.updateSpecialization(
      Number(req.params.id),
      validatedData,
      saveDateFlag
    );

    if (!specialization) return errorResponse(res, "Specialization not found or nothing to update", 404);
    return successResponse(res, specialization, "Specialization updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update specialization", 400);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    console.log(req.params.id,"id")
    const result = await SpecializationService.deleteSpecialization(Number(req.params.id));
    return successResponse(res, result, "Specialization deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to delete specialization", 400);
  }
};
