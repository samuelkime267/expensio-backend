import Expense from "@/models/expense.model";
import { UserDocument } from "@/models/user.model";
import { CreateExpenseSchemaType } from "@/schemas/expense";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const updateExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { amount, category, description, date } =
      req.body as CreateExpenseSchemaType;

    const updatedIncome = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        user: user._id,
      },
      {
        $set: {
          amount,
          date,
          category,
          description,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedIncome) {
      const error = new Error("Expense not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Expense updated successfully",
      success: true,
      data: updatedIncome,
    });
  } catch (error) {
    next(error);
  }
};
