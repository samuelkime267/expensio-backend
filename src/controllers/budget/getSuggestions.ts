import Category from "@/models/category.model";
import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import {
  DEFAULT_BUCKET_MAP,
  getPeriodRange,
  roundUpToNearest,
} from "@/utils/budget";
import { NextFunction, Request, Response } from "express";

export const getSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const now = new Date();
    const year = req.query.year ? Number(req.query.year) : now.getFullYear();
    const month = req.query.month ? Number(req.query.month) : now.getMonth() + 1;

    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      const error = new Error("Invalid year or month") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const { periodStart } = getPeriodRange(year, month);

    const lowerBound = new Date(
      periodStart.getFullYear(),
      periodStart.getMonth() - 3,
      1,
    );

    const lastMonthStart = new Date(
      periodStart.getFullYear(),
      periodStart.getMonth() - 1,
      1,
    );

    const [threeMonthRows, lastMonthRows, incomeRows] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            user: user._id,
            type: "Expense",
            date: { $gte: lowerBound, $lt: periodStart },
          },
        },
        {
          $group: {
            _id: { value: "$category.value", name: "$category.name" },
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: user._id,
            type: "Expense",
            date: { $gte: lastMonthStart, $lt: periodStart },
          },
        },
        {
          $group: {
            _id: "$category.value",
            total: { $sum: "$amount" },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            user: user._id,
            type: "Income",
            date: { $gte: lowerBound, $lt: periodStart },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const lastMonthMap: Record<string, number> = {};
    for (const row of lastMonthRows) lastMonthMap[row._id] = row.total;

    const categories = threeMonthRows
      .filter((row) => row.total > 0)
      .map((row) => {
        const avg3Months = row.total / 3;

        return {
          value: row._id.value,
          name: row._id.name,
          avg3Months: Number(avg3Months.toFixed(0)),
          lastMonth: lastMonthMap[row._id.value] || 0,
          suggested: roundUpToNearest(avg3Months, 500),
          bucket: DEFAULT_BUCKET_MAP[row._id.value] || "FLEXIBLE",
        };
      })
      .sort((a, b) => b.avg3Months - a.avg3Months);

    if (categories.length === 0) {
      const expenseCategories = await Category.find({ isIncome: false });
      for (const category of expenseCategories) {
        categories.push({
          value: category.value,
          name: category.name,
          avg3Months: 0,
          lastMonth: 0,
          suggested: 0,
          bucket: DEFAULT_BUCKET_MAP[category.value] || "FLEXIBLE",
        });
      }
    }

    const incomeTotal = incomeRows[0]?.total || 0;
    const incomeEstimate = roundUpToNearest(incomeTotal / 3, 1000);
    const historicalMonthlyAverage = categories.reduce(
      (sum, category) => sum + category.avg3Months,
      0,
    );

    return res.status(200).json({
      success: true,
      message: "Budget suggestions retrieved successfully",
      data: {
        year,
        month,
        incomeEstimate,
        historicalMonthlyAverage: Number(historicalMonthlyAverage.toFixed(0)),
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};
