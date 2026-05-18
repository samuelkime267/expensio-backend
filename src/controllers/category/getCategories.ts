import Category from "@/models/category.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;

    const categories = await Category.find({
      $or: [{ user: user._id, isDefault: false }, { isDefault: true }],
    });

    if (categories.length === 0) {
      const error = new Error("No categories found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
