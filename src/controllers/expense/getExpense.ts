import Expense from "@/models/expense.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const getExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      const error = new Error("Invalid id") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const income = await Expense.findOne({ _id: id, user: user._id });
    if (!income) {
      const error = new Error("Expense not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Expense retrieved successfully",
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};
