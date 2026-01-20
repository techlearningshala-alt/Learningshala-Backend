import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import * as UserService from "../services/user.service";
import { successResponse, errorResponse } from "../utills/response";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await AuthService.register(name, email, password, role);
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

// OTP Verification (commented out - OTP temporarily disabled)
// export const verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { email, otp } = req.body;
//     const data = await AuthService.verifyOtp(email, otp);
//     return successResponse(res, data, "Login successful");
//   } catch (err: any) {
//     return errorResponse(res, err.message || "OTP verification failed", 401);
//   }
// };

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
  try {
    // auth middleware attaches user to req.user with { id, role } from JWT
    const jwtUser = (req as any).user;
    console.log("🔍 /users/me - JWT token contains:", { id: jwtUser.id, role: jwtUser.role });
    
    // Fetch full user data from database to ensure it's up-to-date
    const fullUser = await UserService.getUserById(jwtUser.id);
    console.log("🔍 /users/me - Database user:", { id: fullUser.id, email: fullUser.email, role: fullUser.role });
    
    // Return only safe fields (exclude password)
    const { password, ...userWithoutPassword } = fullUser;
    return successResponse(res, userWithoutPassword, "Current user");
  } catch (err: any) {
    console.error("❌ /users/me error:", err);
    return errorResponse(res, err.message || "Failed to fetch user", 500);
  }
};
