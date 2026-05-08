import Income from "@/models/income.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const deleteIncome = async (
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
    const deletedIncome = await Income.findOneAndDelete({
      _id: id,
      user: user._id,
    });
    if (!deletedIncome) {
      const error = new Error("Income not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Income deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
