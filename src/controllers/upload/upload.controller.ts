import path from "path";
import { Request, Response } from "express";
import * as UploadService from "../../services/upload/upload.service";
import { successResponse, errorResponse } from "../../utills/response";
import { uploadToS3, deleteFromS3 } from "../../config/s3";

const normalizeFilesArray = (files: Request["files"]) => {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  return Object.values(files).flat();
};

/**
 * Sanitize original filename for use in path: basename only, safe chars.
 * Replaces spaces and problematic chars with hyphen.
 */
function sanitizeFileName(originalname: string): string {
  const basename = path.basename(originalname);
  const ext = path.extname(basename);
  const nameWithoutExt = basename.slice(0, -ext.length) || "file";
  const safe = nameWithoutExt.replace(/[^\w\u00C0-\u024F.-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return (safe || "file") + ext.toLowerCase();
}

/**
 * Get unique filename using original name. If path already exists (for another record), append timestamp before extension.
 * @param excludeUploadId - When updating, pass current record id so the same path can be reused for this record.
 */
async function getUniqueFileNameForUpload(
  file: Express.Multer.File,
  folder: string,
  excludeUploadId?: number
): Promise<string> {
  const sanitized = sanitizeFileName(file.originalname);
  const baseKey = `${folder}/${sanitized}`;
  const existing = await UploadService.getUploadByFilePath(baseKey);
  if (!existing || (excludeUploadId != null && existing.id === excludeUploadId)) {
    return sanitized;
  }
  const ext = path.extname(sanitized);
  const nameWithoutExt = sanitized.slice(0, -ext.length);
  const uniqueName = `${nameWithoutExt}-${Date.now()}${ext}`;
  return uniqueName;
}

const uploadAsset = async (
  file: Express.Multer.File,
  folder: string,
  excludeUploadId?: number
) => {
  const fileName = await getUniqueFileNameForUpload(file, folder, excludeUploadId);
  const key = await uploadToS3(file.buffer, fileName, folder, file.mimetype);
  return key;
};

const getFileType = (mimetype: string): "image" | "pdf" | "video" => {
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("video/")) return "video";
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
    const filePath = await uploadAsset(file, folder, undefined);

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

    const updateData: { name?: string | null; file_path?: string; file_type?: "image" | "pdf" | "video" } = {};

    if (req.body.name !== undefined) {
      updateData.name = (req.body.name as string)?.trim() || null;
    }

    if (req.body.file_type !== undefined) {
      const ft = (req.body.file_type as string)?.toLowerCase();
      updateData.file_type = ft === "pdf" ? "pdf" : ft === "video" ? "video" : "image";
    }

    if (file) {
      try {
        await deleteFromS3(existing.file_path);
      } catch (deleteErr) {
        console.error("Failed to delete old file from S3:", deleteErr);
      }
      const filePath = await uploadAsset(file, "uploads", id);
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
