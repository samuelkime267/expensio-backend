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
    const { amount, category, description, date, type } =
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
    if (previousTransaction.type === "Income") {
      user.balance -= previousTransaction.amount;
      user.balance += amount;
    }
    if (previousTransaction.type === "Expense") {
      user.balance += previousTransaction.amount;
      user.balance -= amount;
    }
    await user.save({ session });

    const updatedIncome = await Transaction.findOneAndUpdate(
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
