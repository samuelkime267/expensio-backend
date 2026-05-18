import Category from "@/models/category.model";
import { UserDocument } from "@/models/user.model";
import { CategorySchemaType } from "@/schemas/category";
import { NextFunction, Request, Response } from "express";

export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const categoryData = req.body as CategorySchemaType;

    const category = await Category.create({
      name: categoryData.name,
      value: categoryData.value,
      description: categoryData.description,
      isIncome: categoryData.isIncome,
      user: user._id,
    });

    return res.status(200).json({
      success: true,
      message: "Categories updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
