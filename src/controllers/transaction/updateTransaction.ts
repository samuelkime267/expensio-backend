import Category from "@/models/category.model";
import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CreateTransactionSchemaType } from "@/schemas/transaction";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = req.user as UserDocument;
    const { amount, category, description, date, type, breakdowns } =
      req.body as CreateTransactionSchemaType;

    const previousTransaction = await Transaction.findOne({
      _id: req.params.id,
      user: user._id,
    });

    if (!previousTransaction) {
      const error = new Error("Transaction not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    const categoryExists = await Category.findOne({
      value: category,
      isIncome: type === "Income",
    });

    if (!categoryExists) {
      const error = new Error("Category not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    const finalAmount =
      breakdowns && breakdowns.length > 0
        ? breakdowns.reduce((sum, item) => sum + item.amount, 0)
        : amount;

    if (previousTransaction.type === "Income") {
      user.balance -= previousTransaction.amount;
      user.balance += finalAmount;
    }
    if (previousTransaction.type === "Expense") {
      user.balance += previousTransaction.amount;
      user.balance -= finalAmount;
    }
    await user.save({ session });

    const updatedIncome = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        user: user._id,
      },
      {
        $set: {
          amount: finalAmount,
          date,
          category: {
            id: categoryExists._id,
            name: categoryExists.name,
            value: categoryExists.value,
          },
          description,
          breakdowns,
          type,
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!updatedIncome) {
      const error = new Error("Transaction not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }
    await session.commitTransaction();

    res.status(200).json({
      message: "Transaction updated successfully",
      success: true,
      data: updatedIncome,
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};
