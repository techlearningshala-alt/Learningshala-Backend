import { Request, Response } from "express";
import { successResponse, errorResponse } from "../utills/response";
import * as HomeTitleDescriptionService from "../services/home_title_description.service";

export const getAll = async (req: Request, res: Response) => {
  try {
    const page = parseInt(String(req.query.page || "1"), 10) || 1;
    const limit = parseInt(String(req.query.limit || "10"), 10) || 10;
    const data = await HomeTitleDescriptionService.listHomeTitleDescriptions(
      page,
      limit
    );
    return successResponse(res, data, "Title & descriptions fetched successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to fetch title & descriptions",
      error?.statusCode || 500
    );
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid ID is required", 400);
    }
    const data = await HomeTitleDescriptionService.getHomeTitleDescription(id);
    return successResponse(res, data, "Title & description fetched successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to fetch title & description",
      error?.statusCode || 500
    );
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { meta_title, meta_description } = req.body;
    const data = await HomeTitleDescriptionService.addHomeTitleDescription(
      meta_title,
      meta_description
    );
    return successResponse(res, data, "Title & description created successfully", 201);
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to create title & description",
      error?.statusCode || 400
    );
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid ID is required", 400);
    }

    const { meta_title, meta_description, saveWithDate = "true" } = req.body;
    const saveDateFlag =
      saveWithDate === true || saveWithDate === "true" || saveWithDate === 1;

    const data = await HomeTitleDescriptionService.updateHomeTitleDescription(
      id,
      meta_title,
      meta_description,
      saveDateFlag
    );
    return successResponse(res, data, "Title & description updated successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to update title & description",
      error?.statusCode || 400
    );
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) {
      return errorResponse(res, "Valid ID is required", 400);
    }
    const data = await HomeTitleDescriptionService.deleteHomeTitleDescription(id);
    return successResponse(res, data, "Title & description deleted successfully");
  } catch (error: any) {
    return errorResponse(
      res,
      error?.message || "Failed to delete title & description",
      error?.statusCode || 400
    );
  }
};
