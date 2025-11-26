import { Request, Response, NextFunction } from "express";
import { AppException } from "../core/exceptions/AppException";
import { ZodError } from "zod";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error:", error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    });
    return;
  }

  // Handle custom application exceptions
  if (error instanceof AppException) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
