import { Request, Response } from "express";
import * as SpecializationImageService from "../../services/courses/specialization_image.service";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";

const normalizeFilesArray = (files: Request["files"]) => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return Object.values(files).flat();
};

const uploadAsset = async (file: Express.Multer.File, folder: string) => {
  const fileName = generateFileName(file.originalname);
  const key = await uploadToS3(file.buffer, fileName, folder, file.mimetype);
  return key;
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await SpecializationImageService.listSpecializationImages(page, limit);
    return successResponse(res, result, "Specialization images fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch specialization images");
  }
};

export const getAllForSelect = async (req: Request, res: Response) => {
  try {
    const result = await SpecializationImageService.listSpecializationImagesForSelect();
    return successResponse(res, result, "Specialization images fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch specialization images");
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid ID", 400);
    }
    const specializationImage = await SpecializationImageService.getSpecializationImage(id);
    if (!specializationImage) {
      return errorResponse(res, "Specialization image not found", 404);
    }
    return successResponse(res, specializationImage, "Specialization image fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch specialization image");
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const files = normalizeFilesArray(req.files);
    const imageFile = files.find((f) => f.fieldname === "image");

    if (!imageFile) {
      return errorResponse(res, "Image file is required", 400);
    }

    const name = req.body.name?.trim();
    if (!name) {
      return errorResponse(res, "Name is required", 400);
    }

    // Upload image to S3 - using the same path as course images
    const imagePath = await uploadAsset(imageFile, "course-images");

    const specializationImage = await SpecializationImageService.createSpecializationImage({
      name,
      image: imagePath,
    });

    return successResponse(res, specializationImage, "Specialization image created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create specialization image", 400);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid ID", 400);
    }

    const files = normalizeFilesArray(req.files);
    const imageFile = files.find((f) => f.fieldname === "image");

    const updateData: any = {};

    if (req.body.name !== undefined) {
      const name = req.body.name?.trim();
      if (!name) {
        return errorResponse(res, "Name cannot be empty", 400);
      }
      updateData.name = name;
    }

    if (imageFile) {
      // Get existing image to delete
      const existing = await SpecializationImageService.getSpecializationImage(id);
      if (existing?.image) {
        try {
          await deleteFromS3(existing.image);
        } catch (deleteErr) {
          console.error("Failed to delete old image:", deleteErr);
        }
      }

      // Upload new image
      const imagePath = await uploadAsset(imageFile, "course-images");
      updateData.image = imagePath;
    }
    // If no new image is uploaded, the existing image is kept (not included in updateData)

    if (Object.keys(updateData).length === 0) {
      return errorResponse(res, "No fields to update", 400);
    }

    const specializationImage = await SpecializationImageService.updateSpecializationImage(id, updateData);
    if (!specializationImage) {
      return errorResponse(res, "Specialization image not found", 404);
    }

    return successResponse(res, specializationImage, "Specialization image updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update specialization image", 400);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid ID", 400);
    }

    // Get existing image to delete from S3
    const existing = await SpecializationImageService.getSpecializationImage(id);
    if (existing?.image) {
      try {
        await deleteFromS3(existing.image);
      } catch (deleteErr) {
        console.error("Failed to delete image from S3:", deleteErr);
      }
    }

    const deleted = await SpecializationImageService.deleteSpecializationImage(id);
    if (!deleted) {
      return errorResponse(res, "Specialization image not found", 404);
    }

    return successResponse(res, null, "Specialization image deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to delete specialization image", 400);
  }
};

