import { Request, Response } from "express";
import {
  createUniversitySpecialization,
  deleteUniversitySpecialization,
  getUniversitySpecializationById,
  getUniversitySpecializationOptions,
  listUniversitySpecializations,
  updateUniversitySpecialization,
} from "../../services/universities/university_specialization.service";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";

export const findAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const universityId = req.query.university_id
      ? Number(req.query.university_id)
      : undefined;
    const universityCourseId = req.query.university_course_id
      ? Number(req.query.university_course_id)
      : undefined;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    const result = await listUniversitySpecializations(page, limit, {
      universityId,
      universityCourseId,
      search,
    });

    return successResponse(
      res,
      result,
      "University specializations fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error fetching university specializations:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch university specializations",
      500
    );
  }
};

export const findOptions = async (req: Request, res: Response) => {
  try {
    const universityCourseId = Number(req.query.university_course_id);
    if (Number.isNaN(universityCourseId)) {
      return errorResponse(res, "university_course_id is required", 400);
    }

    const options = await getUniversitySpecializationOptions(universityCourseId);
    return successResponse(res, options, "Specialization options fetched");
  } catch (error: any) {
    console.error("❌ Error fetching specialization options:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch specialization options",
      500
    );
  }
};

export const findOne = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const specialization = await getUniversitySpecializationById(id);

    if (!specialization) {
      return errorResponse(res, "University specialization not found", 404);
    }

    return successResponse(
      res,
      specialization,
      "University specialization fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error fetching university specialization:", error);
    return errorResponse(
      res,
      error.message || "Failed to fetch university specialization",
      500
    );
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const body = { ...req.body };
    const files = req.files as {
      image?: Express.Multer.File[];
      icon?: Express.Multer.File[];
    };

    if (files?.image?.[0]) {
      const file = files.image[0];
      const fileName = generateFileName(file.originalname);
      body.image = await uploadToS3(
        file.buffer,
        fileName,
        "universities/specializations/images",
        file.mimetype
      );
    }

    if (files?.icon?.[0]) {
      const file = files.icon[0];
      const fileName = generateFileName(file.originalname);
      body.icon = await uploadToS3(
        file.buffer,
        fileName,
        "universities/specializations/icons",
        file.mimetype
      );
    }

    const specialization = await createUniversitySpecialization(body);
    return successResponse(
      res,
      specialization,
      "University specialization created successfully",
      201
    );
  } catch (error: any) {
    console.error("❌ Error creating university specialization:", error);
    return errorResponse(
      res,
      error.message || "Failed to create university specialization",
      400
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const existing = await getUniversitySpecializationById(id);

    if (!existing) {
      return errorResponse(res, "University specialization not found", 404);
    }

    const body = { ...req.body };
    const files = req.files as {
      image?: Express.Multer.File[];
      icon?: Express.Multer.File[];
    };

    if (files?.image?.[0]) {
      const file = files.image[0];
      const fileName = generateFileName(file.originalname);
      const newImage = await uploadToS3(
        file.buffer,
        fileName,
        "universities/specializations/images",
        file.mimetype
      );
      body.image = newImage;

      if (
        existing.image &&
        typeof existing.image === "string" &&
        !existing.image.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.image).catch((err) =>
          console.error("Error deleting previous specialization image:", err)
        );
      }
    } else if (body.image === "" || body.image === "null") {
      body.image = null;
      if (
        existing.image &&
        typeof existing.image === "string" &&
        !existing.image.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.image).catch((err) =>
          console.error("Error deleting previous specialization image:", err)
        );
      }
    }

    if (files?.icon?.[0]) {
      const file = files.icon[0];
      const fileName = generateFileName(file.originalname);
      const newIcon = await uploadToS3(
        file.buffer,
        fileName,
        "universities/specializations/icons",
        file.mimetype
      );
      body.icon = newIcon;

      if (
        existing.icon &&
        typeof existing.icon === "string" &&
        !existing.icon.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.icon).catch((err) =>
          console.error("Error deleting previous specialization icon:", err)
        );
      }
    } else if (body.icon === "" || body.icon === "null") {
      body.icon = null;
      if (
        existing.icon &&
        typeof existing.icon === "string" &&
        !existing.icon.startsWith("/uploads/")
      ) {
        deleteFromS3(existing.icon).catch((err) =>
          console.error("Error deleting previous specialization icon:", err)
        );
      }
    }

    const specialization = await updateUniversitySpecialization(id, body);

    return successResponse(
      res,
      specialization,
      "University specialization updated successfully"
    );
  } catch (error: any) {
    console.error("❌ Error updating university specialization:", error);
    return errorResponse(
      res,
      error.message || "Failed to update university specialization",
      400
    );
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteUniversitySpecialization(id);

    if (!deleted) {
      return errorResponse(res, "University specialization not found", 404);
    }

    return successResponse(
      res,
      null,
      "University specialization deleted successfully"
    );
  } catch (error: any) {
    console.error("❌ Error deleting university specialization:", error);
    return errorResponse(
      res,
      error.message || "Failed to delete university specialization",
      400
    );
  }
};

