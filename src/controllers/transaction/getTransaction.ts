import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      const error = new Error("Invalid id") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const transaction = await Transaction.findOne({
      _id: id,
      user: user._id,
    });

    if (!transaction) {
      const error = new Error("Transaction not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Transaction retrieved successfully",
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};
