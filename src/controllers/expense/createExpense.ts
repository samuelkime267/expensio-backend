import Expense from "@/models/expense.model";
import { UserDocument } from "@/models/user.model";
import { CreateExpenseSchemaType } from "@/schemas/expense";
import { NextFunction, Request, Response } from "express";

export const createExpense = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { amount, category, description, date, name } =
      req.body as CreateExpenseSchemaType;

    const income = await Expense.create({
      user: user._id,
      amount,
      date,
      category,
      description,
      name,
    });

    res.status(200).json({
      message: "Expense created successfully",
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};
