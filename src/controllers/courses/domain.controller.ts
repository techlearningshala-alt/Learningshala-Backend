import { Request, Response } from "express";
import { createDomainSchema, updateDomainSchema } from "../../validators/courses/domain.validator";
import DomainService from "../../services/courses/domain.service";
import { successResponse, errorResponse } from "../../utills/response";
import slugify from "slugify";

export const create = async (req: Request, res: Response) => {
  try {
    const validated = createDomainSchema.parse(req.body);

    const slug = slugify(validated.name, { lower: true, strict: true });
    console.log(req.body,"slug")
    const domainToCreate : any = {
      ...validated,
      slug
    };

    const data = await DomainService.addDomain(domainToCreate);
    return successResponse(res, data, "Domain created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Creation failed", 400);
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const{saveWithDate} = req.body 
    const validated : any = updateDomainSchema.parse(req.body);

    if (validated.name) {
      validated["slug"] = slugify(validated.name, { lower: true, strict: true });
    }
    console.log(req.body,"body")

    console.log(validated,"validated")

    const updated = await DomainService.updateDomain(Number(req.params.id), validated, saveWithDate);
    console.log(updated,"updated")
    if (!updated) return errorResponse(res, "Domain not found", 404);

    return successResponse(res, updated, "Domain updated successfully");
  } catch (err: any) {
    return errorResponse(res, err.message || "Update failed", 400);
  }
};

export const getAll = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", onlyVisible = "false" } = req.query;
    const data = await DomainService.getAllDomains(
      parseInt(page as string),
      parseInt(limit as string),
      onlyVisible === "true"
    );
    return successResponse(res, data);
  } catch (err: any) {
    return errorResponse(res, err.message, 400);
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await DomainService.getDomainById(Number(req.params.id));
    if (!data) return errorResponse(res, "Domain not found", 404);
    return successResponse(res, data);
  } catch (err: any) {
    return errorResponse(res, err.message, 400);
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const deleted = await DomainService.deleteDomain(Number(req.params.id));
    if (!deleted) return errorResponse(res, "Domain not found", 404);
    return successResponse(res, null, "Domain deleted successfully");
  } catch (err: any) {
    return errorResponse(res, err.message, 400);
  }
};
