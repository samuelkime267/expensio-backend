import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      const error = new Error("Invalid id") as CustomError;
      error.statusCode = 400;
      throw error;
    }
    const deletedTransaction = await Transaction.findOneAndDelete(
      {
        _id: id,
        user: user._id,
      },
      {
        session,
      },
    );

    if (!deletedTransaction) {
      const error = new Error("Transaction not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    if (deletedTransaction.type === "Income") {
      user.balance -= deletedTransaction.amount;
    }
    if (deletedTransaction.type === "Expense") {
      user.balance += deletedTransaction.amount;
    }
    await user.save({ session });

    res.status(200).json({
      message: "Transaction deleted successfully",
      success: true,
      data: deletedTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    await session.endSession();
  }
};
