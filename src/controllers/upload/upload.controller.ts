import { Request, Response } from "express";
import * as UploadService from "../../services/upload/upload.service";
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

const getFileType = (mimetype: string): "image" | "pdf" => {
  if (mimetype === "application/pdf") return "pdf";
  return "image";
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await UploadService.listUploads(page, limit);
    return successResponse(res, result, "Uploads fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch uploads");
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid ID", 400);
    }
    const upload = await UploadService.getUpload(id);
    if (!upload) {
      return errorResponse(res, "Upload not found", 404);
    }
    return successResponse(res, upload, "Upload fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch upload");
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const files = normalizeFilesArray(req.files);
    const file = files.find((f) => f.fieldname === "file");

    if (!file) {
      return errorResponse(res, "File is required", 400);
    }

    const name = (req.body.name as string)?.trim() || null;
    const fileType = (req.body.file_type as string)?.toLowerCase() === "pdf" ? "pdf" : "image";

    const folder = "uploads";
    const filePath = await uploadAsset(file, folder);

    const upload = await UploadService.createUpload({
      name,
      file_path: filePath,
      file_type: fileType,
    });

    return successResponse(res, upload, "Upload created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create upload", 400);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid ID", 400);
    }

    const existing = await UploadService.getUpload(id);
    if (!existing) {
      return errorResponse(res, "Upload not found", 404);
    }

    const files = normalizeFilesArray(req.files);
    const file = files.find((f) => f.fieldname === "file");

    const updateData: { name?: string | null; file_path?: string; file_type?: "image" | "pdf" } = {};

    if (req.body.name !== undefined) {
      updateData.name = (req.body.name as string)?.trim() || null;
    }

    if (req.body.file_type !== undefined) {
      updateData.file_type = (req.body.file_type as string)?.toLowerCase() === "pdf" ? "pdf" : "image";
    }

    if (file) {
      try {
        await deleteFromS3(existing.file_path);
      } catch (deleteErr) {
        console.error("Failed to delete old file from S3:", deleteErr);
      }
      const filePath = await uploadAsset(file, "uploads");
      updateData.file_path = filePath;
      if (!updateData.file_type) {
        updateData.file_type = getFileType(file.mimetype);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return successResponse(res, existing, "Upload unchanged");
    }

    const upload = await UploadService.updateUpload(id, updateData);
    return successResponse(res, upload, "Upload updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update upload", 400);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return errorResponse(res, "Invalid ID", 400);
    }

    const existing = await UploadService.getUpload(id);
    if (existing?.file_path) {
      try {
        await deleteFromS3(existing.file_path);
      } catch (deleteErr) {
        console.error("Failed to delete file from S3:", deleteErr);
      }
    }

    const deleted = await UploadService.deleteUpload(id);
    if (!deleted) {
      return errorResponse(res, "Upload not found", 404);
    }

    return successResponse(res, null, "Upload deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to delete upload", 400);
  }
};
