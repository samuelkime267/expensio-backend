import Budget from "@/models/budget.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import {
  enrichBudgetItems,
  getDaysElapsed,
  getDaysInMonth,
  getPeriodRange,
  getPreviousPeriod,
  getSpentMap,
} from "@/utils/budget";
import { NextFunction, Request, Response } from "express";

export const getBudget = async (
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

    const { periodStart, periodEnd } = getPeriodRange(year, month);
    const { year: prevYear, month: prevMonth } = getPreviousPeriod(year, month);
    const {
      periodStart: previousStart,
      periodEnd: previousEnd,
    } = getPeriodRange(prevYear, prevMonth);

    const [budget, previousBudget, spentMap, previousSpentMap] =
      await Promise.all([
        Budget.findOne({ user: user._id, periodStart }),
        Budget.findOne({ user: user._id, periodStart: previousStart }),
        getSpentMap(user._id, periodStart, periodEnd),
        getSpentMap(user._id, previousStart, previousEnd),
      ]);

    if (!budget) {
      return res.status(200).json({
        success: true,
        message: "No budget found for the period",
        data: { budget: null },
      });
    }

    const previousBudgetAmountMap: Record<string, number> = {};
    if (previousBudget) {
      for (const item of previousBudget.items) {
        const value = item.category?.value;
        if (value) previousBudgetAmountMap[value] = item.amount;
      }
    }

    const daysInMonth = getDaysInMonth(year, month);
    const daysElapsed = getDaysElapsed(year, month);

    const items = enrichBudgetItems(
      budget.items,
      spentMap,
      previousSpentMap,
      previousBudgetAmountMap,
      daysInMonth,
      daysElapsed,
    );

    const totalPlanned = items.reduce((sum, item) => sum + item.amount, 0);
    const totalSpent = items.reduce((sum, item) => sum + item.spent, 0);
    const income = budget.income || 0;
    const remaining = income - totalPlanned;
    const safeToSpend = Math.max(0, remaining);
    const percentageUsed = income > 0 ? (totalSpent / income) * 100 : 0;
    const daysLeft = Math.max(0, daysInMonth - daysElapsed);
    const weeklySafe = safeToSpend / Math.max(1, Math.ceil(daysLeft / 7));

    return res.status(200).json({
      success: true,
      message: "Budget retrieved successfully",
      data: {
        budget: {
          _id: budget._id,
          periodStart: budget.periodStart,
          periodEnd: budget.periodEnd,
          income,
          daysInMonth,
          daysElapsed,
          createdAt: budget.createdAt,
          updatedAt: budget.updatedAt,
          overview: {
            totalPlanned,
            totalSpent,
            income,
            remaining,
            safeToSpend,
            weeklySafe: Number(weeklySafe.toFixed(0)),
            percentageUsed: Number(percentageUsed.toFixed(1)),
          },
          items,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
