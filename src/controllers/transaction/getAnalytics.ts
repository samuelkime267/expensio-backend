import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { getDateRange } from "@/utils";
import { NextFunction, Request, Response } from "express";
import { PipelineStage } from "mongoose";

type Duration = "day" | "week" | "month" | "year" | "all-time";

const allowedDurations: Duration[] = [
  "day",
  "week",
  "month",
  "year",
  "all-time",
];

const SMALL_PURCHASE_THRESHOLD = 5000;

const sumTotals = (rows: any[]) => {
  let income = 0;
  let expense = 0;

  for (const row of rows) {
    if (row._id === "Income") income = row.total;
    if (row._id === "Expense") expense = row.total;
  }

  return { income, expense };
};

export const getAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;

    const duration = (req.query.duration || "month") as Duration;

    if (!allowedDurations.includes(duration)) {
      const error = new Error("Invalid duration") as CustomError;
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();

    let currentStartDate: Date = now;
    let previousStartDate: Date | null = null;

    // YEAR
    if (duration === "year") {
      currentStartDate = new Date(now.getFullYear(), 0, 1);
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
    }

    // ALL TIME (start from earliest transaction)
    if (duration === "all-time") {
      const earliest = await Transaction.findOne({ user: user._id })
        .sort({ date: 1 })
        .select("date");

      currentStartDate = earliest?.date || now;
      previousStartDate = null;
    }

    // DAY / WEEK / MONTH
    if (duration === "day" || duration === "week" || duration === "month") {
      const { currentStartDate: cur, previousStartDate: pre } =
        getDateRange(duration);
      currentStartDate = cur;
      previousStartDate = pre;
    }

    const currentMatch: any = {
      user: user._id,
      date: {
        $gte: currentStartDate,
        $lte: now,
      },
    };

    const previousMatch: any = previousStartDate
      ? {
          user: user._id,
          date: {
            $gte: previousStartDate,
            $lt: currentStartDate,
          },
        }
      : null;

    const totalPipeline = (match: any): PipelineStage[] => [
      {
        $match: match,
      },
      {
        $group: {
          _id: "$type",
          total: {
            $sum: "$amount",
          },
        },
      },
    ];

    const categoryPipeline = (match: any): PipelineStage[] => [
      {
        $match: match,
      },
      {
        $group: {
          _id: "$category.name",
          amount: {
            $sum: "$amount",
          },
        },
      },
      {
        $sort: {
          amount: -1,
        },
      },
    ];

    const [currentTotals, previousTotals, currentCategories, previousCategories] =
      await Promise.all([
        Transaction.aggregate(totalPipeline(currentMatch)),
        previousMatch
          ? Transaction.aggregate(totalPipeline(previousMatch))
          : Promise.resolve([]),
        Transaction.aggregate(
          categoryPipeline({ ...currentMatch, type: "Expense" }),
        ),
        previousMatch
          ? Transaction.aggregate(
              categoryPipeline({ ...previousMatch, type: "Expense" }),
            )
          : Promise.resolve([]),
      ]);

    const { income, expense } = sumTotals(currentTotals);
    const prev = sumTotals(previousTotals);

    const net = income - expense;

    const savingsRate = income > 0 ? (net / income) * 100 : 0;

    const spendingBreakdown = currentCategories.map((category) => ({
      name: category._id,
      amount: category.amount,
    }));

    const previousCategoryMap = new Map(
      previousCategories.map((category) => [category._id, category.amount]),
    );

    const spendingTrends = currentCategories.map((category) => {
      const previousAmount = previousCategoryMap.get(category._id) || 0;

      let percentageChange: number | null = null;

      if (previousAmount > 0) {
        percentageChange = Number(
          (
            ((category.amount - previousAmount) / previousAmount) *
            100
          ).toFixed(1),
        );
      }

      return {
        name: category._id,
        amount: category.amount,
        previousAmount,
        percentageChange,
      };
    });

    // =========================================
    // HABITS
    // =========================================

    let biggestIncrease: { name: string; percentageChange: number } | null =
      null;

    for (const trend of spendingTrends) {
      if (trend.percentageChange !== null && trend.percentageChange > 0) {
        if (
          !biggestIncrease ||
          trend.percentageChange > biggestIncrease.percentageChange
        ) {
          biggestIncrease = {
            name: trend.name,
            percentageChange: trend.percentageChange,
          };
        }
      }
    }

    const smallPurchaseResult = await Transaction.aggregate([
      {
        $match: {
          ...currentMatch,
          type: "Expense",
          amount: {
            $lte: SMALL_PURCHASE_THRESHOLD,
          },
        },
      },
      {
        $group: {
          _id: null,
          count: {
            $sum: 1,
          },
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const smallPurchases = {
      count: smallPurchaseResult[0]?.count || 0,
      total: smallPurchaseResult[0]?.total || 0,
    };

    const weekendResult = await Transaction.aggregate([
      {
        $match: {
          ...currentMatch,
          type: "Expense",
        },
      },
      {
        $group: {
          _id: {
            $dayOfWeek: "$date",
          },
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    let weekendDays = 0;
    let weekdayDays = 0;

    for (
      let day = new Date(currentStartDate);
      day <= now;
      day.setDate(day.getDate() + 1)
    ) {
      const dayOfWeek = day.getDay();

      if (dayOfWeek === 0 || dayOfWeek === 6) weekendDays++;
      else weekdayDays++;
    }

    let weekendTotal = 0;
    let weekdayTotal = 0;

    for (const row of weekendResult) {
      // $dayOfWeek => 1 (Sun) ... 7 (Sat)
      if (row._id === 1 || row._id === 7) weekendTotal += row.total;
      else weekdayTotal += row.total;
    }

    const weekendAverage = weekendDays > 0 ? weekendTotal / weekendDays : 0;
    const weekdayAverage = weekdayDays > 0 ? weekdayTotal / weekdayDays : 0;

    let weekendDifferencePercent: number | null = null;

    if (weekdayAverage > 0) {
      weekendDifferencePercent = Number(
        (
          ((weekendAverage - weekdayAverage) / weekdayAverage) *
          100
        ).toFixed(1),
      );
    }

    // =========================================
    // WHERE DID YOUR MONEY GO
    // =========================================

    const whereMoneyWent = {
      income,
      categories: spendingBreakdown.map(({ name, amount }) => ({
        name,
        amount,
      })),
      remaining: net,
    };

    // =========================================
    // REVIEW
    // =========================================

    let review: string;

    if (previousStartDate) {
      const previousRate =
        prev.income > 0 ? ((prev.income - prev.expense) / prev.income) * 100 : 0;

      const rateDelta = savingsRate - previousRate;

      const expenseDelta =
        prev.expense > 0 ? ((expense - prev.expense) / prev.expense) * 100 : null;

      if (expenseDelta !== null && expenseDelta < 0) {
        review = `Your spending dropped by ${Math.abs(expenseDelta).toFixed(
          0,
        )}% compared to the previous period. Keep it up!`;
      } else if (rateDelta > 0.5) {
        review = `Your savings rate improved by ${rateDelta.toFixed(
          0,
        )} percentage points compared to the previous period.`;
      } else if (rateDelta < -0.5) {
        review = `Your savings rate dipped by ${Math.abs(rateDelta).toFixed(
          0,
        )} percentage points compared to the previous period.`;
      } else {
        review = `Your savings rate held steady at ${savingsRate.toFixed(
          0,
        )}% this period.`;
      }
    } else {
      review =
        income > 0
          ? `You saved ${savingsRate.toFixed(
              0,
            )}% of your income overall. Keep building those habits.`
          : "Log your first transaction to start seeing insights here.";
    }

    res.status(200).json({
      success: true,
      message: "Analytics retrieved successfully",
      data: {
        duration,
        income,
        expense,
        net,
        savingsRate: Number(savingsRate.toFixed(1)),
        previous: {
          income: prev.income,
          expense: prev.expense,
        },
        spendingBreakdown,
        spendingTrends,
        habits: {
          biggestIncrease,
          smallPurchases,
          weekendSpend: {
            weekendAverage: Number(weekendAverage.toFixed(2)),
            weekdayAverage: Number(weekdayAverage.toFixed(2)),
            differencePercent: weekendDifferencePercent,
          },
        },
        whereMoneyWent,
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};
