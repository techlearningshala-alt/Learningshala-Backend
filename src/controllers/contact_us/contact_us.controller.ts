import { Request, Response } from "express";
import { successResponse, errorResponse } from "../../utills/response";
import {
  createContactUs,
  listContactUs,
  getContactUsById,
  deleteContactUs,
} from "../../services/contact_us/contact_us.service";
import { authMiddleware } from "../../middlewares/auth.middleware";

export const create = async (req: Request, res: Response) => {
  try {
    const contact = await createContactUs(req.body);
    return successResponse(
      res,
      contact,
      "Contact message submitted successfully",
      201
    );
  } catch (error: any) {
    console.error("❌ Error creating contact us:", error);
    return errorResponse(
      res,
      error?.message || "Failed to submit contact message",
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

    const data = await listContactUs(page, limit, { search, fromDate, toDate });
    return successResponse(res, data, "Contact messages fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching contact messages:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch contact messages",
      error?.statusCode || 500
    );
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
      return errorResponse(res, "Valid contact ID is required", 400);
    }

    const contact = await getContactUsById(id);
    if (!contact) {
      return errorResponse(res, "Contact message not found", 404);
    }

    return successResponse(res, contact, "Contact message fetched successfully");
  } catch (error: any) {
    console.error("❌ Error fetching contact message:", error);
    return errorResponse(
      res,
      error?.message || "Failed to fetch contact message",
      error?.statusCode || 500
    );
  }
};

export const deleteOne = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
      return errorResponse(res, "Valid contact ID is required", 400);
    }

    const deleted = await deleteContactUs(id);
    if (!deleted) {
      return errorResponse(res, "Contact message not found", 404);
    }

    return successResponse(res, null, "Contact message deleted successfully");
  } catch (error: any) {
    console.error("❌ Error deleting contact message:", error);
    return errorResponse(
      res,
      error?.message || "Failed to delete contact message",
      error?.statusCode || 500
    );
  }
};

