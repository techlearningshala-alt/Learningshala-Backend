import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ success: false, message: "No authorization header" });

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return res.status(401).json({ success: false, message: "Invalid auth header" });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, ACCESS_SECRET) as any;
    // attach minimal user to request
    (req as any).user = { 
      id: payload.id, 
      role: payload.role,
      can_create: payload.can_create,
      can_read: payload.can_read,
      can_update: payload.can_update,
      can_delete: payload.can_delete
    };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthenticated" });
    if (!allowedRoles.includes(user.role)) return res.status(403).json({ success: false, message: "Forbidden" });
    next();
  };
};
