import Income from "@/models/income.model";
import { UserDocument } from "@/models/user.model";
import { CreateIncomeSchemaType } from "@/schemas/income";
import { CustomError } from "@/types";
import { NextFunction, Request, Response } from "express";

export const updateIncome = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user as UserDocument;
    const { amount, category, description, date } =
      req.body as CreateIncomeSchemaType;

    const updatedIncome = await Income.findOneAndUpdate(
      {
        _id: req.params.id,
        user: user._id,
      },
      {
        $set: {
          amount,
          date,
          category,
          description,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedIncome) {
      const error = new Error("Income not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: "Income updated successfully",
      success: true,
      data: updatedIncome,
    });
  } catch (error) {
    next(error);
  }
};
