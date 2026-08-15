import Budget from "@/models/budget.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const deleteBudget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;

    const budget = await Budget.findOneAndDelete({ _id: id, user: user._id });

    if (!budget) {
      const error = new Error("Budget not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
