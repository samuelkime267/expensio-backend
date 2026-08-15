import Goal from "@/models/goal.model";
import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { roundUpToNearest } from "@/utils/budget";
import { NextFunction, Request, Response } from "express";

export const getGoals = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const now = new Date();

    const [goals, contributionRows] = await Promise.all([
      Goal.find({ user: user._id }).sort({ createdAt: 1 }),
      Transaction.aggregate([
        {
          $match: {
            user: user._id,
            type: "Expense",
            goalId: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$goalId",
            total: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const savedMap: Record<string, number> = {};
    for (const row of contributionRows) savedMap[String(row._id)] = row.total;

    const data = goals.map((goal) => {
      const saved = savedMap[String(goal._id)] || 0;
      const monthsLeft = Math.max(
        1,
        (goal.targetDate.getFullYear() - now.getFullYear()) * 12 +
          (goal.targetDate.getMonth() - now.getMonth()),
      );
      const remaining = Math.max(0, goal.targetAmount - saved);
      const progress =
        goal.targetAmount > 0 ? (saved / goal.targetAmount) * 100 : 0;

      return {
        _id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        monthlyContribution: goal.monthlyContribution,
        saved,
        remaining,
        monthsLeft,
        progress: Number(progress.toFixed(1)),
        recommendedContribution: roundUpToNearest(remaining / monthsLeft, 1000),
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Goals retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
