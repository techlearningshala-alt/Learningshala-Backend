import { Request, Response, NextFunction } from "express";
import * as UniversityApprovalService from "../../services/universities/university_approval.service";
import {
  createUniversityApprovalSchema,
  updateUniversityApprovalSchema,
} from "../../validators/universities/university.validator";
import { successResponse } from "../../utills/response";
import { uploadToS3, deleteFromS3 } from "../../config/s3";
import { generateFileName } from "../../config/multer";

export const getAllUniversityApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await UniversityApprovalService.listUniversityApprovals(page, limit);
    successResponse(res, result, "University approvals fetched successfully", 200);
  } catch (err) {
    next(err);
  }
};

export const getApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await UniversityApprovalService.listApprovals();
    successResponse(res, result, "University approvals fetched successfully", 200);
  } catch (err) {
    next(err);
  }
};

export const getUniversityApprovalById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await UniversityApprovalService.getUniversityApprovalById(id);
    if (!result) return successResponse(res, null, "University approval not found", 404);
    successResponse(res, result, "University approval fetched successfully", 200);
  } catch (err) {
    next(err);
  }
};

export const createUniversityApproval = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = createUniversityApprovalSchema.safeParse(req.body);
    if (!parsed.success) {
      return successResponse(res, parsed.error, "Validation error", 400);
    }

    let logo: string | null = null;

    if (req.file) {
      // Upload to S3
      const fileName = generateFileName(req.file.originalname);
      logo = await uploadToS3(
        req.file.buffer,
        fileName,
        "university-approvals",
        req.file.mimetype
      );
    }

    const result = await UniversityApprovalService.addUniversityApproval({
      ...parsed.data,
      logo,
    });

    successResponse(res, result, "University approval created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateUniversityApproval = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    // const parsed = updateUniversityApprovalSchema.safeParse(req.body);
    // if (!parsed.success) {
    //   return successResponse(res, parsed.error, "Validation error", 400);
    // }

    console.log("📝 UPDATE Request:", {
      file: req.file,
      body: req.body,
      existingLogo: req.body.existingLogo
    });
    
    // Build update data
    const updateData: any = {
      title: req.body.title,
      description: req.body.description,
    };

        // Get current approval to delete old logo from S3
    const currentApproval: any = await UniversityApprovalService.getUniversityApprovalById(id);

    // Handle logo update logic
    if (req.file) {
      // New file uploaded → upload to S3
      const fileName = generateFileName(req.file.originalname);
      updateData.logo = await uploadToS3(
        req.file.buffer,
        fileName,
        "university-approvals",
        req.file.mimetype
      );
      console.log("✅ Using new uploaded logo:", updateData.logo);

      // Delete old logo from S3 if it exists and is not a local path
      if (currentApproval?.logo && typeof currentApproval.logo === "string" && !currentApproval.logo.startsWith("/uploads/")) {
        await deleteFromS3(currentApproval.logo);
      }
    } else if (req.body.existingLogo && req.body.existingLogo.trim() !== "" && req.body.existingLogo !== "null" && req.body.existingLogo !== "undefined") {
      // Keep existing logo
      updateData.logo = req.body.existingLogo;
      console.log("✅ Keeping existing logo:", updateData.logo);
    } else {
      // No logo change - don't include in update
      console.log("⚠️ No logo update (preserving database value)");
    }

    console.log("📦 Final updateData:", updateData);

    const result = await UniversityApprovalService.updateUniversityApproval(id, updateData);

    successResponse(res, result, "University approval updated successfully", 200);
  } catch (err) {
    next(err);
  }
};

export const deleteUniversityApproval = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const result = await UniversityApprovalService.deleteUniversityApproval(id);
    successResponse(res, result, "University approval deleted successfully", 200);
  } catch (err) {
    next(err);
  }
};
