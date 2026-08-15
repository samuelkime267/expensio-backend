import Category from "@/models/category.model";
import Goal from "@/models/goal.model";
import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { ContributeGoalSchemaType } from "@/schemas/goal";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const contributeToGoal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;
    const { amount } = req.body as ContributeGoalSchemaType;

    const goal = await Goal.findOne({ _id: id, user: user._id });

    if (!goal) {
      const error = new Error("Goal not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    const category = await Category.findOne({
      value: "savings",
      isIncome: false,
    });

    if (!category) {
      const error = new Error("Savings category not found") as CustomError;
      error.statusCode = 500;
      throw error;
    }

    user.balance -= amount;
    await user.save();

    const transaction = await Transaction.create({
      user: user._id,
      name: `Contribution to ${goal.name}`,
      amount,
      date: new Date(),
      category: {
        id: category._id,
        name: category.name,
        value: category.value,
      },
      type: "Expense",
      goalId: goal._id,
    });

    return res.status(200).json({
      success: true,
      message: "Contribution added successfully",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};
