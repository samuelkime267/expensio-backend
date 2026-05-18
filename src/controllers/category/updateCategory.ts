import Category from "@/models/category.model";
import { UserDocument } from "@/models/user.model";
import { CategorySchemaType } from "@/schemas/category";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const user = req.user as UserDocument;
    const categoryData = req.body as CategorySchemaType;

    if (!id || typeof id !== "string") {
      const error = new Error("Invalid id") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const category = await Category.findOneAndUpdate(
      {
        user: user._id,
        isDefault: false,
        _id: id,
      },
      {
        $set: {
          name: categoryData.name,
          value: categoryData.value,
          description: categoryData.description,
          isIncome: categoryData.isIncome,
          updatedAt: Date.now(),
        },
      },
    );

    if (!category) {
      const error = new Error("Category not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Categories updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
