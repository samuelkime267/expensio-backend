import { NextFunction, Request, Response } from "express";
import { createExpenseSchema, expenseSchema } from "@/schemas/expense";

export const expenseValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    const parsedBody = expenseSchema.parse(body);
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};

export const createExpenseValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    const parsedBody = createExpenseSchema.parse(body);
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};
