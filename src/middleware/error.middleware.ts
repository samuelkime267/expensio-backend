import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { zodErrorFormatter } from "@/utils";
import { CustomError } from "@/types";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let error: CustomError = { ...err, message: err.message };

    console.error(err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
      return res.status(422).json({
        success: false,
        error: "ValidationErrors",
        errors: zodErrorFormatter(err),
        message: "Validation failed",
      });
    }

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
      error = new Error("Resource not found") as CustomError;
      error.statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      error = new Error("Duplicate field value entered") as CustomError;
      error.statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((val: any) => ({
        field: val.path,
        message: val.message,
      }));

      error = new Error("Validation failed") as CustomError;
      error.statusCode = 422;
      error.errors = errors;
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
