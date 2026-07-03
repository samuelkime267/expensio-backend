import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

/**
 * I want to include pagination and filter
 *  for pagination - current page, count, remaining page
 * for filter - type="income or expense", date- time period start time and stop time,
 *
 */

export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const currentPage = Number(req.query.page) || 1;
    const itemCount = Number(req.query.count) || 20;
    const type = req.query.type;
    const startDate = Number(req.query.startDate) || 0;
    const endDate = Number(req.query.endDate) || Date.now();

    const transactions = await Transaction.find({
      user: user._id,
      ...(type && { type }),
      date: { $gte: startDate, $lte: endDate },
    })
      .limit(itemCount)
      .skip((currentPage - 1) * itemCount);

    res.status(200).json({
      message: "Transactions retrieved successfully",
      success: true,
      data: {
        transactions,
        // continue with this
        pagination: {
          currentPage,
          nextPage: 0,
          maxPage: 0,
          count: itemCount,
          totalItems: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
