import { Request, Response } from "express";
import * as CityService from "../../services/location/city.service";
import { successResponse, errorResponse } from "../../utills/response";

export const getAllByState = async (req: Request, res: Response) => {
  try {
    const stateId = parseInt(req.params.stateId);
    if (isNaN(stateId)) {
      return errorResponse(res, "Invalid State ID", 400);
    }

    const search = req.query.search as string | undefined;

    const result = await CityService.listCitiesByState(stateId, search);
    return successResponse(res, result, "Cities fetched successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch cities");
  }
};
