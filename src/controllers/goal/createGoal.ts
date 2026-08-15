import Goal from "@/models/goal.model";
import { UserDocument } from "@/models/user.model";
import { CreateGoalSchemaType } from "@/schemas/goal";
import { roundUpToNearest } from "@/utils/budget";
import { NextFunction, Request, Response } from "express";

export const createGoal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { name, targetAmount, targetDate } =
      req.body as CreateGoalSchemaType;

    const now = new Date();
    const monthsLeft = Math.max(
      1,
      (targetDate.getFullYear() - now.getFullYear()) * 12 +
        (targetDate.getMonth() - now.getMonth()),
    );
    const monthlyContribution = roundUpToNearest(
      targetAmount / monthsLeft,
      1000,
    );

    const goal = await Goal.create({
      user: user._id,
      name,
      targetAmount,
      targetDate,
      monthlyContribution,
    });

    return res.status(200).json({
      success: true,
      message: "Goal created successfully",
      data: {
        _id: goal._id,
        name: goal.name,
        targetAmount: goal.targetAmount,
        targetDate: goal.targetDate,
        monthlyContribution: goal.monthlyContribution,
        saved: 0,
        remaining: goal.targetAmount,
        monthsLeft,
        progress: 0,
        recommendedContribution: monthlyContribution,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
