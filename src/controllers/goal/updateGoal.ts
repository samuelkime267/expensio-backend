import Goal from "@/models/goal.model";
import { UserDocument } from "@/models/user.model";
import { UpdateGoalSchemaType } from "@/schemas/goal";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const updateGoal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;
    const { name, targetAmount, targetDate, monthlyContribution } =
      req.body as UpdateGoalSchemaType;

    const goal = await Goal.findOne({ _id: id, user: user._id });

    if (!goal) {
      const error = new Error("Goal not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    goal.name = name;
    goal.targetAmount = targetAmount;
    goal.targetDate = targetDate;
    goal.monthlyContribution = monthlyContribution;

    await goal.save();

    return res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (error) {
    next(error);
  }
};
