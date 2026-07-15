import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for ${field}. Please use another value`;
    statusCode = 400;
  }

  if (err.name === "CastError") {
    message = "Resource not found";
    statusCode = 404;
  }

  if (err.name === "ValidationError") {
    message = Object.values(err as any)
      .map((val: any) => val.message)
      .join(", ");
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

export default errorHandler;
