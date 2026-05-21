import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CreateTransactionSchemaType } from "@/schemas/transaction";
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
          category,
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
