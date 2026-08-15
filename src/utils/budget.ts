import Category from "@/models/category.model";
import Transaction from "@/models/transaction.model";
import { CustomError } from "@/types";

export type BudgetItemType = "FIXED" | "FLEXIBLE" | "GOAL";

export const DEFAULT_BUCKET_MAP: Record<string, BudgetItemType> = {
  rent_housing: "FIXED",
  utilities: "FIXED",
  phone_internet: "FIXED",
  health_medical: "FIXED",
  school_education: "FIXED",
  loan_repayment: "FIXED",
  groceries: "FIXED",
  food: "FIXED",
  transport: "FIXED",
  family_support: "FIXED",
  personal_care: "FIXED",
  entertainment: "FLEXIBLE",
  shopping: "FLEXIBLE",
  subscriptions: "FLEXIBLE",
  miscellaneous: "FLEXIBLE",
};

export const roundUpToNearest = (amount: number, nearest: number) => {
  if (amount <= 0) return 0;
  return Math.max(nearest, Math.ceil(amount / nearest) * nearest);
};

export const getBudgetStatus = (amount: number, spent: number) => {
  if (amount <= 0) return "NO_BUDGET";
  const percentageUsed = (spent / amount) * 100;
  if (percentageUsed > 100) return "OVER_BUDGET";
  if (percentageUsed >= 90) return "NEAR_LIMIT";
  if (percentageUsed >= 70) return "ON_TRACK";
  return "UNDER_BUDGET";
};

export const getPeriodRange = (year: number, month: number) => {
  const periodStart = new Date(year, month - 1, 1);
  const periodEnd = new Date(year, month, 0, 23, 59, 59, 999);
  return { periodStart, periodEnd };
};

export const getPreviousPeriod = (year: number, month: number) => {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
};

export const getDaysInMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

export const getDaysElapsed = (year: number, month: number) => {
  const now = new Date();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() === month - 1;
  return isCurrentMonth
    ? Math.max(1, now.getDate())
    : getDaysInMonth(year, month);
};

export const getSpentMap = async (
  userId: unknown,
  start: Date,
  end: Date,
): Promise<Record<string, number>> => {
  const rows: any[] = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        type: "Expense",
        date: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$category.value",
        total: { $sum: "$amount" },
      },
    },
  ]);

  const spentMap: Record<string, number> = {};
  for (const row of rows) spentMap[row._id] = row.total;
  return spentMap;
};

export const buildBudgetItems = async (
  items: { category: string; amount: number; type: string }[],
) => {
  const expenseCategories = await Category.find({ isIncome: false });
  const categoryMap = new Map(
    expenseCategories.map((category) => [category.value, category]),
  );

  const budgetItems = items.map(({ category, amount, type }) => {
    const categoryDoc = categoryMap.get(category);

    if (!categoryDoc) {
      const error = new Error(
        `Category "${category}" not found or is not an expense category`,
      ) as CustomError;
      error.statusCode = 400;
      throw error;
    }

    return {
      category: {
        id: categoryDoc._id,
        name: categoryDoc.name,
        value: categoryDoc.value,
      },
      amount,
      type,
    };
  });

  const values = budgetItems.map((item) => item.category.value);

  if (new Set(values).size !== values.length) {
    const error = new Error("Duplicate category in budget") as CustomError;
    error.statusCode = 400;
    throw error;
  }

  return budgetItems;
};

export const enrichBudgetItems = (
  items: any[],
  spentMap: Record<string, number>,
  previousSpentMap: Record<string, number>,
  previousBudgetAmountMap: Record<string, number>,
  daysInMonth: number,
  daysElapsed: number,
) =>
  items.map((item) => {
    const spent = spentMap[item.category.value] || 0;
    const amount = item.amount || 0;
    const remaining = amount - spent;
    const percentageUsed = amount > 0 ? (spent / amount) * 100 : 0;
    const expectedSpend = Math.round((amount * daysElapsed) / daysInMonth);
    const pace =
      spent > expectedSpend
        ? "ahead"
        : spent < expectedSpend
          ? "behind"
          : "on-track";

    return {
      _id: item._id,
      category: item.category,
      amount,
      type: item.type,
      spent,
      remaining,
      percentageUsed: Number(percentageUsed.toFixed(1)),
      status: getBudgetStatus(amount, spent),
      expectedSpend,
      pace,
      previousSpent: previousSpentMap[item.category.value] || 0,
      previousBudgetAmount: previousBudgetAmountMap[item.category.value] || 0,
    };
  });
