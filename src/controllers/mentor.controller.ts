import { Request, Response, NextFunction } from "express";
import * as MentorService from "../services/mentor.service";
import { addMentor } from "../services/mentor.service";
import { createMentorSchema } from "../validators/mentor.validator";
import { successResponse } from "../utills/response";
import { uploadToS3, deleteFromS3 } from "../config/s3";
import { generateFileName } from "../config/multer";

export const getAllMentors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("coming")
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await MentorService.listMentors(page, limit);
    successResponse( res , result , "Metnors fetched successfully", 201 );
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await MentorService.getMentor(Number(req.params.id))); }
  catch (err) { next(err); }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1️⃣ Validate file
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Thumbnail image is required" });
    }
    console.log(req.file);

    // Upload to S3
    const fileName = generateFileName(req.file.originalname);
    const logo = await uploadToS3(
      req.file.buffer,
      fileName,
      "mentors",
      req.file.mimetype
    );

    // 2️⃣ Extract and convert body fields
    const body = {
      name: req.body.name,
      experience: Number(req.body.experience),
      verified: req.body.verified === "true" || req.body.verified === true,
      assist_student: Number(req.body.assist_student),
      connection_link: req.body.connection_link,
      label: req.body.label,
      // status: req.body.status,
    };
    // 3️⃣ Validate body fields
    const validatedData = createMentorSchema.parse(body);

    // 5️⃣ Save to database
    const result = await addMentor({
      ...validatedData,
      thumbnail: logo,
    });

    return successResponse(res, result, "Mentor created successfully", 201);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

 // Update mentor
// Update mentor
export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { saveWithDate, existingThumbnail, ...rest } = req.body;

    const saveDateFlag = saveWithDate === "true";

    // Get current mentor to delete old thumbnail from S3
    const currentMentor: any = await MentorService.getMentor(Number(id));

    // Build updates object
    const updates: any = { ...rest };
    updates.verified = Boolean(updates.verified);

    if (req.file) {
      // New file uploaded → upload to S3
      const fileName = generateFileName(req.file.originalname);
      updates.thumbnail = await uploadToS3(
        req.file.buffer,
        fileName,
        "mentors",
        req.file.mimetype
      );

      // Delete old thumbnail from S3 if it exists and is not a local path
      if (currentMentor?.thumbnail && typeof currentMentor.thumbnail === "string" && !currentMentor.thumbnail.startsWith("/uploads/")) {
        await deleteFromS3(currentMentor.thumbnail);
      }
    } else if (existingThumbnail) {
      // No new file → keep existing thumbnail
      updates.thumbnail = existingThumbnail;
    }

    console.log("Updates going to DB:", updates);

    const mentor = await MentorService.updateMentor(Number(id), updates, saveDateFlag);

    if (!mentor) {
      return res.status(404).json({
        success: false,
        message: "Mentor not found",
      });
    }

    res.json({
      success: true,
      message: "Mentor updated successfully",
      data: mentor,
    });
  } catch (err) {
    next(err);
  }
};







  

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await MentorService.deleteMentor(Number(req.params.id))); }
  catch (err) { next(err); }
};
