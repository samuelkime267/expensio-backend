import Budget from "@/models/budget.model";
import { UserDocument } from "@/models/user.model";
import { UpdateBudgetSchemaType } from "@/schemas/budget";
import { CustomError } from "@/types";
import { buildBudgetItems } from "@/utils/budget";
import { NextFunction, Request, Response } from "express";

export const updateBudget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;
    const { income, items } = req.body as UpdateBudgetSchemaType;

    const budget = await Budget.findOne({ _id: id, user: user._id });

    if (!budget) {
      const error = new Error("Budget not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    budget.income = income;
    const budgetItems = await buildBudgetItems(items);
    budget.items.splice(0, budget.items.length, ...budgetItems);

    await budget.save();

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};
