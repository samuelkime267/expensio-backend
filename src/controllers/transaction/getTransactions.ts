import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;

    // if (!id || typeof id !== "string") {
    //   const error = new Error("Invalid id") as CustomError;
    //   error.statusCode = 400;
    //   throw error;
    // }

    const transactions = await Transaction.find({
      user: user._id,
    });

    res.status(200).json({
      message: "Transactions retrieved successfully",
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};
