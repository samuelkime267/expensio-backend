import Budget from "@/models/budget.model";
import { UserDocument } from "@/models/user.model";
import { MoveMoneySchemaType } from "@/schemas/budget";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const moveMoney = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;
    const { fromValue, toValue, amount } = req.body as MoveMoneySchemaType;

    const budget = await Budget.findOne({ _id: id, user: user._id });

    if (!budget) {
      const error = new Error("Budget not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    const fromItem = budget.items.find(
      (item) => item.category?.value === fromValue,
    );
    const toItem = budget.items.find(
      (item) => item.category?.value === toValue,
    );

    if (!fromItem || !toItem) {
      const error = new Error("Move money between two budget items") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    if (fromItem.amount - amount < 0) {
      const error = new Error(
        "Not enough budget left in the source category",
      ) as CustomError;
      error.statusCode = 400;
      throw error;
    }

    fromItem.amount -= amount;
    toItem.amount += amount;
    budget.markModified("items");

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
