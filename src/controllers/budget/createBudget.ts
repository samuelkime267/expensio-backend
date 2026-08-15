import Budget from "@/models/budget.model";
import { UserDocument } from "@/models/user.model";
import { CreateBudgetSchemaType } from "@/schemas/budget";
import { CustomError } from "@/types";
import { buildBudgetItems, getPeriodRange } from "@/utils/budget";
import { NextFunction, Request, Response } from "express";

export const createBudget = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { year, month, income, items } = req.body as CreateBudgetSchemaType;

    const { periodStart, periodEnd } = getPeriodRange(year, month);

    const existing = await Budget.findOne({ user: user._id, periodStart });

    if (existing) {
      const error = new Error("Budget already exists for this period") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const budgetItems = await buildBudgetItems(items);

    const budget = await Budget.create({
      user: user._id,
      periodStart,
      periodEnd,
      income,
      items: budgetItems,
    });

    return res.status(200).json({
      success: true,
      message: "Budget created successfully",
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};
