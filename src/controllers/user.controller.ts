import { Request, Response, NextFunction } from "express";
import * as UserService from "../services/user.service";
import { successResponse, errorResponse } from "../utills/response";

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const role = req.query.role as string | undefined; // Filter by role if provided
    const result = await UserService.listUsers(page, limit, role);
    return successResponse(res, result, "Users fetched successfully", 200);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to fetch users", err.statusCode || 500);
  }
};

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.getUserById(Number(req.params.id));
    return successResponse(res, user, "User fetched successfully", 200);
  } catch (err: any) {
    return errorResponse(res, err.message || "User not found", err.statusCode || 404);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await UserService.createUser(req.body);
    return successResponse(res, user, "User created successfully", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to create user", err.statusCode || 400);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const user = await UserService.updateUser(id, req.body);
    return successResponse(res, user, "User updated successfully", 200);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to update user", err.statusCode || 400);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await UserService.deleteUser(id);
    return successResponse(res, null, "User deleted successfully", 200);
  } catch (err: any) {
    return errorResponse(res, err.message || "Failed to delete user", err.statusCode || 400);
  }
};
