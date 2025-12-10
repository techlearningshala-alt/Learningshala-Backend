import { Request, Response } from "express";
import * as StateService from "../../services/location/state.service";
import { successResponse, errorResponse } from "../../utills/response";

export const getAll = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;

    const result = await StateService.listStates(search);
    return successResponse(res, result, "States fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch states");
  }
};
