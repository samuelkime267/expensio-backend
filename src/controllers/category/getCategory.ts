import Category from "@/models/category.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = req.user as UserDocument;

    if (!id || typeof id !== "string") {
      const error = new Error("Invalid id") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const category = await Category.findOne({
      user: user._id,
      isDefault: false,
      _id: id,
    });

    if (!category) {
      const error = new Error("No category found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
