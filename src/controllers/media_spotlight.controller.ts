import { Request, Response, NextFunction } from "express";
import * as MediaService from "../services/media_spotlight.service";
import { successResponse } from "../utills/response";
import { uploadToS3, deleteFromS3 } from "../config/s3";
import { generateFileName } from "../config/multer";

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
   const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await MediaService.listMedia(page, limit);
       return successResponse(res, result, "Fetched media spotlight successfully");
      } catch (err) {
        next(err);
      }
    }

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await MediaService.getMedia(Number(req.params.id))); }
  catch (err) {
    console.log(err)
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let logo: string = "";

    if (req.file) {
      // Upload to S3
      const fileName = generateFileName(req.file.originalname);
      logo = await uploadToS3(
        req.file.buffer,
        fileName,
        "media-spotlight",
        req.file.mimetype
      );
    } else if (req.body.logo) {
      logo = req.body.logo;
    }

    const { title, link } = req.body;
    res.status(201).json(await MediaService.addMedia(title, logo, link));
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { title, link, saveWithDate = "true", existingLogo } = req.body;

    // Convert string flag → boolean
    const saveDateFlag = saveWithDate === "true";

    // Get current media to delete old logo from S3
    const currentMedia: any = await MediaService.getMedia(Number(req.params.id));

    let logo: string | undefined = existingLogo;

    if (req.file) {
      // New file uploaded → upload to S3
      const fileName = generateFileName(req.file.originalname);
      logo = await uploadToS3(
        req.file.buffer,
        fileName,
        "media-spotlight",
        req.file.mimetype
      );

      // Delete old logo from S3 if it exists and is not a local path
      if (currentMedia?.logo && typeof currentMedia.logo === "string" && !currentMedia.logo.startsWith("/uploads/")) {
        await deleteFromS3(currentMedia.logo);
      }
    }

    console.log(logo, "logo");
    console.log(existingLogo, "logo");
    const result = await MediaService.updateMedia(
      Number(req.params.id),
      title,
      logo,
      link,
      saveDateFlag
    );

    res.json({ success: true, message: "Media spotlight updated successfully", data: result });
  } catch (err) {
    next(err);
  }
};

export const reorder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { order } = req.body;
    const result = await MediaService.reorderMediaSpotlight(order);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await MediaService.deleteMedia(Number(req.params.id))); }
  catch (err) { next(err); }
};
