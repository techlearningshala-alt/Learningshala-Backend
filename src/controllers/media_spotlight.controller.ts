import { Request, Response, NextFunction } from "express";
import * as MediaService from "../services/media_spotlight.service";
import { successResponse } from "../utills/response";

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
    const logo = req.file ? `/uploads/${req.file.filename}` : req.body.logo;
    const { title, link } = req.body;
    res.status(201).json(await MediaService.addMedia(title, logo, link));
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { title, link, saveWithDate = "true", existingLogo } = req.body;

    // Convert string flag → boolean
    const saveDateFlag = saveWithDate === "true";

    let logo: string | undefined;
    if (req.file) {
      // New file uploaded
      logo = `/uploads/${req.file.filename}`;
    } else if (existingLogo) {
      // Preserve existing logo if no new file
      logo = existingLogo;
    }
    console.log(logo, "logo")
    console.log(existingLogo, "logo")
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
