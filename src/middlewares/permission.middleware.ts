import { Request, Response, NextFunction } from "express";
import { successResponse, errorResponse } from "../utills/response";

/**
 * Middleware to check if user has permission for a specific CRUD operation
 * @param permission - The permission to check ('create', 'read', 'update', 'delete')
 */
export const checkPermission = (permission: 'create' | 'read' | 'update' | 'delete') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return errorResponse(res, "Unauthenticated", 401);
    }

    // Admin role has all permissions
    if (user.role === "admin") {
      return next();
    }

    // Check permission based on operation
    const permissionKey = `can_${permission}`;
    const hasPermission = user[permissionKey];

    if (!hasPermission) {
      return errorResponse(res, "You are not authorized to perform this action.", 403);
    }

    next();
  };
};

