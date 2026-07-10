import { Request, Response, NextFunction } from "express";
import * as PostAdmissionTeamService from "../services/post_admission_team.service";
import { addPostAdmissionTeamMember } from "../services/post_admission_team.service";
import { createPostAdmissionTeamSchema } from "../validators/post_admission_team.validator";
import { successResponse } from "../utills/response";
import { uploadToS3, deleteFromS3 } from "../config/s3";
import { generateFileName } from "../config/multer";

const S3_FOLDER = "post-admission-team";

const parseAssistStudent = (value: unknown): number => {
  if (value === "" || value == null || value === undefined) return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
};

const parseOptionalString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await PostAdmissionTeamService.listPostAdmissionTeam(page, limit);
    successResponse(res, result, "Post admission team fetched successfully", 200);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await PostAdmissionTeamService.getPostAdmissionTeamMember(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Thumbnail image is required" });
    }

    const fileName = generateFileName(req.file.originalname);
    const thumbnail = await uploadToS3(req.file.buffer, fileName, S3_FOLDER, req.file.mimetype);

    const body = {
      name: req.body.name,
      experience: Number(req.body.experience),
      verified: req.body.verified === "true" || req.body.verified === true,
      assist_student: parseAssistStudent(req.body.assist_student),
      qualification: parseOptionalString(req.body.qualification),
      connection_link: parseOptionalString(req.body.connection_link) ?? "",
      label: parseOptionalString(req.body.label) ?? "",
    };

    const validatedData = createPostAdmissionTeamSchema.parse(body);

    const result = await addPostAdmissionTeamMember({
      ...validatedData,
      thumbnail,
    });

    return successResponse(res, result, "Post admission team member created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { saveWithDate, existingThumbnail, ...rest } = req.body;
    const saveDateFlag = saveWithDate === "true";

    const current = await PostAdmissionTeamService.getPostAdmissionTeamMember(Number(id));

    const updates: Record<string, unknown> = { ...rest };
    updates.verified = Boolean(updates.verified);
    updates.assist_student = parseAssistStudent(updates.assist_student);

    if (Object.prototype.hasOwnProperty.call(rest, "qualification")) {
      updates.qualification = parseOptionalString(updates.qualification);
    }
    if (Object.prototype.hasOwnProperty.call(rest, "connection_link")) {
      updates.connection_link = parseOptionalString(updates.connection_link) ?? "";
    }
    if (Object.prototype.hasOwnProperty.call(rest, "label")) {
      updates.label = parseOptionalString(updates.label) ?? "";
    }

    if (req.file) {
      const fileName = generateFileName(req.file.originalname);
      updates.thumbnail = await uploadToS3(
        req.file.buffer,
        fileName,
        S3_FOLDER,
        req.file.mimetype
      );
      if (
        current?.thumbnail &&
        typeof current.thumbnail === "string" &&
        !current.thumbnail.startsWith("/uploads/")
      ) {
        await deleteFromS3(current.thumbnail);
      }
    } else if (existingThumbnail) {
      updates.thumbnail = existingThumbnail;
    }

    const result = await PostAdmissionTeamService.updatePostAdmissionTeamMember(
      Number(id),
      updates as any,
      saveDateFlag
    );

    res.json({
      success: true,
      message: "Post admission team member updated successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(
      await PostAdmissionTeamService.deletePostAdmissionTeamMember(Number(req.params.id))
    );
  } catch (err) {
    next(err);
  }
};
