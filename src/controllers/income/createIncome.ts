import Income from "@/models/income.model";
import { UserDocument } from "@/models/user.model";
import { CreateIncomeSchemaType } from "@/schemas/income";
import { NextFunction, Request, Response } from "express";

export const createIncome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { amount, category, description, date } =
      req.body as CreateIncomeSchemaType;

    const income = await Income.create({
      user: user._id,
      amount,
      date,
      category,
      description,
    });

    res.status(200).json({
      message: "Income created successfully",
      success: true,
      data: income,
    });
  } catch (error) {
    next(error);
  }
};
