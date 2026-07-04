import { insertDefaultCategories } from "@/utils";
import { NextFunction, Request, Response } from "express";

export const addDefaultCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await insertDefaultCategories();

    return res.status(201).json({
      success: true,
      message: "Default categories added successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
