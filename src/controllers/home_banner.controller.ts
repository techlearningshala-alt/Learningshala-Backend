import { Request, Response, NextFunction } from "express";
import * as HomeBannerService from "../services/home_banner.service";
import { createHomeBannerSchema, updateHomeBannerSchema } from "../validators/home_banner.validator";
import { successResponse, errorResponse } from "../utills/response";
import { uploadToS3, deleteFromS3 } from "../config/s3";
import { generateFileName } from "../config/multer";
import { CreateHomeBannerDto, UpdateHomeBannerDto } from "../models/home_banner.model";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await HomeBannerService.listHomeBanners(page, limit);
    return successResponse(res, result, "Home banners fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch home banners", 500);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await HomeBannerService.getHomeBanner(Number(req.params.id));
    if (!banner) {
      return errorResponse(res, "Home banner not found", 404);
    }
    return successResponse(res, banner, "Home banner fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch home banner", 500);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = req.files as any;
    let imageUrl: string | null = null;

    // Handle banner image upload if provided
    const imageFile = files?.banner_image?.[0] || files?.banner_image;
    if (imageFile) {
      const fileName = generateFileName(imageFile.originalname);
      imageUrl = await uploadToS3(
        imageFile.buffer,
        fileName,
        "home/banners",
        imageFile.mimetype
      );
    }

    const body = {
      banner_image: imageUrl ?? null,
      video_id: req.body.video_id ?? null,
      video_title: req.body.video_title ?? null,
      url: req.body.url ?? null,
    };

    const validatedData = createHomeBannerSchema.parse(body);
    // Ensure all optional fields are null instead of undefined
    const createData: CreateHomeBannerDto = {
      banner_image: validatedData.banner_image ?? null,
      video_id: validatedData.video_id ?? null,
      video_title: validatedData.video_title ?? null,
      url: validatedData.url ?? null,
    };
    const result = await HomeBannerService.createHomeBanner(createData);

    return successResponse(res, result, "Home banner created successfully", 201);
  } catch (err: any) {
    console.error("❌ Error creating home banner:", err);
    return errorResponse(res, err.message || "Failed to create home banner", 400);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { saveWithDate, existingImage, ...rest } = req.body;
    const files = req.files as any;

    const saveDateFlag = saveWithDate === "true" || saveWithDate === true;

    // Get current banner to delete old image from S3
    const currentBanner: any = await HomeBannerService.getHomeBanner(Number(id));
    if (!currentBanner) {
      return errorResponse(res, "Home banner not found", 404);
    }

    // Build updates object
    const updates: any = { ...rest };

    // Handle banner image upload
    const imageFile = files?.banner_image?.[0] || files?.banner_image;
    if (imageFile) {
      // New file uploaded → upload to S3
      const fileName = generateFileName(imageFile.originalname);
      updates.banner_image = await uploadToS3(
        imageFile.buffer,
        fileName,
        "home/banners",
        imageFile.mimetype
      );

      // Delete old image from S3 if it exists and is not a local path
      if (
        currentBanner?.banner_image &&
        typeof currentBanner.banner_image === "string" &&
        !currentBanner.banner_image.startsWith("/uploads/")
      ) {
        await deleteFromS3(currentBanner.banner_image);
      }
    } else if (existingImage) {
      // No new file → keep existing image
      updates.banner_image = existingImage;
    } else if (req.body.banner_image === "" || req.body.banner_image === "null") {
      // Image was removed
      if (
        currentBanner?.banner_image &&
        typeof currentBanner.banner_image === "string" &&
        !currentBanner.banner_image.startsWith("/uploads/")
      ) {
        await deleteFromS3(currentBanner.banner_image);
      }
      updates.banner_image = null;
    }

    const validatedData = updateHomeBannerSchema.parse(updates);
    // Ensure all optional fields are null instead of undefined
    const updateData: UpdateHomeBannerDto = {};
    if (validatedData.banner_image !== undefined) updateData.banner_image = validatedData.banner_image ?? null;
    if (validatedData.video_id !== undefined) updateData.video_id = validatedData.video_id ?? null;
    if (validatedData.video_title !== undefined) updateData.video_title = validatedData.video_title ?? null;
    if (validatedData.url !== undefined) updateData.url = validatedData.url ?? null;
    
    const success = await HomeBannerService.updateHomeBanner(Number(id), updateData, saveDateFlag);

    if (!success) {
      return errorResponse(res, "Failed to update home banner", 500);
    }

    const updated = await HomeBannerService.getHomeBanner(Number(id));
    return successResponse(res, updated, "Home banner updated successfully");
  } catch (err: any) {
    console.error("❌ Error updating home banner:", err);
    return errorResponse(res, err.message || "Failed to update home banner", 400);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    
    // Get banner to delete image from S3
    const banner: any = await HomeBannerService.getHomeBanner(id);
    if (!banner) {
      return errorResponse(res, "Home banner not found", 404);
    }

    // Delete image from S3 if it exists
    if (banner.banner_image && typeof banner.banner_image === "string" && !banner.banner_image.startsWith("/uploads/")) {
      await deleteFromS3(banner.banner_image);
    }

    const success = await HomeBannerService.deleteHomeBanner(id);
    if (!success) {
      return errorResponse(res, "Failed to delete home banner", 500);
    }

    return successResponse(res, null, "Home banner deleted successfully");
  } catch (err: any) {
    console.error("❌ Error deleting home banner:", err);
    return errorResponse(res, err.message || "Failed to delete home banner", 500);
  }
};
