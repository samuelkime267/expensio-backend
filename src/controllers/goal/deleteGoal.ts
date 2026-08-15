import Goal from "@/models/goal.model";
import Transaction from "@/models/transaction.model";
import { UserDocument } from "@/models/user.model";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const deleteGoal = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { id } = req.params;

    const goal = await Goal.findOneAndDelete({ _id: id, user: user._id });

    if (!goal) {
      const error = new Error("Goal not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    await Transaction.updateMany(
      { goalId: goal._id },
      { $set: { goalId: null } },
    );

    return res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
