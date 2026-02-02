import { Request, Response, NextFunction } from "express";
import * as WebsiteBannerService from "../services/website_banner.service";
import { createWebsiteBannerSchema, updateWebsiteBannerSchema } from "../validators/website_banner.validator";
import { successResponse, errorResponse } from "../utills/response";
import { uploadToS3, deleteFromS3 } from "../config/s3";
import { generateFileName } from "../config/multer";
import { CreateWebsiteBannerDto, UpdateWebsiteBannerDto } from "../models/website_banner.model";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Fetch all banners (no filtering by type - frontend will filter)
    const result = await WebsiteBannerService.listWebsiteBanners(page, limit, undefined);
    return successResponse(res, result, "Banners fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch banners", 500);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banner = await WebsiteBannerService.getWebsiteBanner(Number(req.params.id));
    if (!banner) {
      return errorResponse(res, "Website banner not found", 404);
    }
    return successResponse(res, banner, "Website banner fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch website banner", 500);
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
        "website/banners",
        imageFile.mimetype
      );
    }

    const body = {
      banner_image: imageUrl ?? null,
      video_id: req.body.video_id ?? null,
      video_title: req.body.video_title ?? null,
      url: req.body.url ?? null,
      banner_type: req.body.banner_type, // Required field - validator will catch if missing
    };

    const validatedData = createWebsiteBannerSchema.parse(body);
    // Ensure all optional fields are null instead of undefined
    const createData: CreateWebsiteBannerDto = {
      banner_image: validatedData.banner_image ?? null,
      video_id: validatedData.video_id ?? null,
      video_title: validatedData.video_title ?? null,
      url: validatedData.url ?? null,
      banner_type: validatedData.banner_type, // Required - will be 'website' or 'mobile'
    };
    const result = await WebsiteBannerService.createWebsiteBanner(createData);

    return successResponse(res, result, "Website banner created successfully", 201);
  } catch (err: any) {
    console.error("❌ Error creating website banner:", err);
    return errorResponse(res, err.message || "Failed to create website banner", 400);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { saveWithDate, existingImage, ...rest } = req.body;
    const files = req.files as any;

    const saveDateFlag = saveWithDate === "true" || saveWithDate === true;

    // Get current banner to delete old image from S3
    const currentBanner: any = await WebsiteBannerService.getWebsiteBanner(Number(id));
    if (!currentBanner) {
      return errorResponse(res, "Website banner not found", 404);
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
        "website/banners",
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

    const validatedData = updateWebsiteBannerSchema.parse(updates);
    // Ensure all optional fields are null instead of undefined
    const updateData: UpdateWebsiteBannerDto = {};
    if (validatedData.banner_image !== undefined) updateData.banner_image = validatedData.banner_image ?? null;
    if (validatedData.video_id !== undefined) updateData.video_id = validatedData.video_id ?? null;
    if (validatedData.video_title !== undefined) updateData.video_title = validatedData.video_title ?? null;
    if (validatedData.url !== undefined) updateData.url = validatedData.url ?? null;
    if (validatedData.banner_type !== undefined) updateData.banner_type = validatedData.banner_type;
    
    const success = await WebsiteBannerService.updateWebsiteBanner(Number(id), updateData, saveDateFlag);

    if (!success) {
      return errorResponse(res, "Failed to update website banner", 500);
    }

    const updated = await WebsiteBannerService.getWebsiteBanner(Number(id));
    return successResponse(res, updated, "Website banner updated successfully");
  } catch (err: any) {
    console.error("❌ Error updating website banner:", err);
    return errorResponse(res, err.message || "Failed to update website banner", 400);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    
    // Get banner to delete image from S3
    const banner: any = await WebsiteBannerService.getWebsiteBanner(id);
    if (!banner) {
      return errorResponse(res, "Website banner not found", 404);
    }

    // Delete image from S3 if it exists
    if (banner.banner_image && typeof banner.banner_image === "string" && !banner.banner_image.startsWith("/uploads/")) {
      await deleteFromS3(banner.banner_image);
    }

    const success = await WebsiteBannerService.deleteWebsiteBanner(id);
    if (!success) {
      return errorResponse(res, "Failed to delete website banner", 500);
    }

    return successResponse(res, null, "Website banner deleted successfully");
  } catch (err: any) {
    console.error("❌ Error deleting website banner:", err);
    return errorResponse(res, err.message || "Failed to delete website banner", 500);
  }
};
