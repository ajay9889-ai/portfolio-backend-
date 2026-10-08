import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = "statusCode" in err ? err.statusCode : 500;
  const message = err.message || "An unexpected server error occurred";

  console.error(`[API Error] ${statusCode} - ${message}`);

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
};
