import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { getDateRange } from "@/utils";
import { NextFunction, Request, Response } from "express";

export const getTotal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const duration = req.query.duration;

    if (duration && typeof duration !== "string") {
      const error = new Error("Invalid duration") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();

    let currentStartDate: Date | null = null;
    let previousStartDate: Date | null = null;

    // DEFAULT => ALL TIME

    if (duration === "day" || duration === "week" || duration === "month") {
      const { currentStartDate: cur, previousStartDate: pre } =
        getDateRange(duration);
      currentStartDate = cur;
      previousStartDate = pre;
    }

    // CURRENT PERIOD QUERY
    const currentIncomeMatch: any = {
      user: user._id,
      type: "Income",
    };
    const currentExpenseMatch: any = {
      user: user._id,
      type: "Expense",
    };

    if (currentStartDate) {
      currentIncomeMatch.date = {
        $gte: currentStartDate,
        $lte: now,
      };
      currentExpenseMatch.date = {
        $gte: currentStartDate,
        $lte: now,
      };
    }

    // PREVIOUS PERIOD QUERY
    const previousIncomeMatch: any = {
      user: user._id,
      type: "Income",
    };
    const previousExpenseMatch: any = {
      user: user._id,
      type: "Income",
    };

    if (currentStartDate && previousStartDate) {
      previousIncomeMatch.date = {
        $gte: previousStartDate,
        $lt: currentStartDate,
      };
      previousExpenseMatch.date = {
        $gte: previousStartDate,
        $lt: currentStartDate,
      };
    }

    const [
      currentIncomeResult,
      previousIncomeResult,
      currentExpenseResult,
      previousExpenseResult,
    ] = await Promise.all([
      Transaction.aggregate([
        {
          $match: currentIncomeMatch,
        },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: "$amount",
            },
          },
        },
      ]),

      Transaction.aggregate([
        {
          $match: previousIncomeMatch,
        },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: "$amount",
            },
          },
        },
      ]),

      Transaction.aggregate([
        {
          $match: currentExpenseMatch,
        },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: "$amount",
            },
          },
        },
      ]),

      Transaction.aggregate([
        {
          $match: previousExpenseMatch,
        },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: "$amount",
            },
          },
        },
      ]),
    ]);

    const currentExpense: number = currentExpenseResult[0]?.totalIncome || 0;
    const previousExpense: number = previousExpenseResult[0]?.totalIncome || 0;

    let expensePercentageChange = 0;

    if (previousExpense > 0) {
      expensePercentageChange =
        ((currentExpense - previousExpense) / previousExpense) * 100;
    }

    const currentIncome: number = currentIncomeResult[0]?.totalIncome || 0;
    const previousIncome: number = previousIncomeResult[0]?.totalIncome || 0;

    let incomePercentageChange = 0;

    if (previousIncome > 0) {
      incomePercentageChange =
        ((currentIncome - previousIncome) / previousIncome) * 100;
    }

    res.status(200).json({
      success: true,
      message: "Transaction total fetched successfully",
      data: {
        income: {
          total: currentIncome,
          previousTotal: previousIncome,
          percentageChange: Number(incomePercentageChange.toFixed(2)),
        },
        expense: {
          total: currentExpense,
          previousTotal: previousExpense,
          percentageChange: Number(expensePercentageChange.toFixed(2)),
        },
        duration: duration || "all-time",
      },
    });
  } catch (error) {
    next(error);
  }
};
