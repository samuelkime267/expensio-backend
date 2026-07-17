import Category from "@/models/category.model";
import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CreateTransactionSchemaType } from "@/schemas/transaction";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const user = req.user as UserDocument;
    const { amount, category, description, date, name, type } =
      req.body as CreateTransactionSchemaType;

    const categoryExists = await Category.findOne({
      value: category,
      isIncome: type === "Income",
    });

    if (!categoryExists) {
      const error = new Error("Category not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    const isIncome = type === "Income";
    if (isIncome) user.balance += amount;
    if (!isIncome) user.balance -= amount;

    await user.save({ session });

    const transaction = await Transaction.create(
      [
        {
          user: user._id,
          amount,
          date,
          category: {
            id: categoryExists._id,
            name: categoryExists.name,
            value: categoryExists.value,
          },
          description,
          name,
          type,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(200).json({
      message: "Transaction created successfully",
      success: true,
      data: transaction[0],
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};
