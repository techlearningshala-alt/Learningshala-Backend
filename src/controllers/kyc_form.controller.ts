import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import { createKycForm, listKycForms, getKycFormById } from "../services/kyc_form.service";
import { createKycFormSchema } from "../validators/kyc_form.validator";
import { uploadToS3, getS3Url } from "../config/s3";
import { generateFileName } from "../config/multer";
import { sendKycFormNotificationEmail } from "../utills/kyc-form-notify-email";

const S3_FOLDER = "kyc-forms";

const DOC_FIELDS = [
  "doc_id",
  "doc_pan",
  "doc_shop_addr",
  "doc_cheque",
  "doc_photo_out",
  "doc_photo_in",
] as const;

type DocField = (typeof DOC_FIELDS)[number];

const uploadDocFiles = async (
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined
): Promise<Partial<Record<DocField, string>>> => {
  const uploaded: Partial<Record<DocField, string>> = {};
  if (!files) return uploaded;

  const list: Express.Multer.File[] = Array.isArray(files)
    ? files
    : Object.values(files).flat();

  for (const file of list) {
    const field = file.fieldname as DocField;
    if (!DOC_FIELDS.includes(field)) continue;
    const fileName = generateFileName(file.originalname);
    const key = await uploadToS3(file.buffer, fileName, S3_FOLDER, file.mimetype);
    uploaded[field] = key;
  }

  return uploaded;
};

const withDocUrls = <T extends Record<string, any>>(row: T): T => {
  const out: T = { ...row };
  for (const field of DOC_FIELDS) {
    if ((out as any)[field]) {
      (out as any)[field] = getS3Url(String((out as any)[field]));
    }
  }
  return out;
};

export const create = async (req: Request, res: Response) => {
  try {
    const validated = createKycFormSchema.parse(req.body);
    const uploadedDocs = await uploadDocFiles(req.files as any);

    const entry = await createKycForm({
      ...validated,
      ...uploadedDocs,
    });

    const responseData = withDocUrls(entry);

    // Non-blocking: API success even if email fails.
    sendKycFormNotificationEmail(responseData).catch((emailErr) => {
      console.error("⚠️ KYC notify email failed:", emailErr);
    });

    return successResponse(
      res,
      responseData,
      "KYC form submitted successfully",
      201
    );
  } catch (error: any) {
    console.error("❌ Error creating KYC form:", error);
    if (error?.name === "ZodError") {
      return errorResponse(res, error.errors?.[0]?.message || "Validation error", 400);
    }
    return errorResponse(
      res,
      error?.message || "Failed to submit KYC form",
      error?.statusCode || 400
    );
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const fromDate =
      typeof req.query.fromDate === "string" ? req.query.fromDate.trim() : undefined;
    const toDate =
      typeof req.query.toDate === "string" ? req.query.toDate.trim() : undefined;

    const data = await listKycForms(page, limit, { search, fromDate, toDate });
    return successResponse(
      res,
      {
        ...data,
        data: (data.data || []).map((row) => withDocUrls(row)),
      },
      "KYC forms fetched successfully"
    );
  } catch (error: any) {
    console.error("❌ Error fetching KYC forms:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch KYC forms",
      error?.statusCode || 500
    );
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid KYC form ID is required", 400);
    }

    const entry = await getKycFormById(id);
    if (!entry) {
      return errorResponse(res, "KYC form not found", 404);
    }

    return successResponse(res, withDocUrls(entry), "KYC form fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching KYC form:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch KYC form",
      error?.statusCode || 500
    );
  }
};
