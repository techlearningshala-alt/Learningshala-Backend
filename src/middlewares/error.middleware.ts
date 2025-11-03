import { Request, Response, NextFunction } from "express";
import { logger } from "../utills/logger";
import multer from "multer"; // import to check MulterError

export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let status = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle Multer errors specifically
  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.message; // e.g., "File too large"
  }

  logger.error(`${req.method} ${req.url} - ${message} - ${err.stack || ""}`);

  res.status(status).json({ success: false, message }); // note: using "message" key
};
