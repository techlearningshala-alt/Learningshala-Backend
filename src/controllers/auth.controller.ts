import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import { successResponse, errorResponse } from "../utills/response";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role, phone, course, state, city, otp } = req.body;
    const user = await AuthService.register(name, email, password, role, phone, course, state, city, otp);
    return successResponse(res, { id: user.id, name: user.name, email: user.email, role: user.role }, "Registered", 201);
  } catch (err: any) {
    return errorResponse(res, err.message || "Registration failed", 400);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const data = await AuthService.login(email, password);
    return successResponse(res, data, "Login successful");
  } catch (err: any) {
    return errorResponse(res, err.message || "Login failed", 401);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const data = await AuthService.refresh(refreshToken);
    return successResponse(res, data, "Token refreshed");
  } catch (err: any) {
    return errorResponse(res, err.message || "Refresh failed", 401);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);
    return successResponse(res, null, "Logged out");
  } catch (err: any) {
    return errorResponse(res, err.message || "Logout failed", 400);
  }
};

export const me = async (req: Request, res: Response) => {
  // auth middleware attaches user to req.user
  const user = (req as any).user;
  return successResponse(res, user, "Current user");
};
