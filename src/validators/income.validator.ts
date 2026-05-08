import { NextFunction, Request, Response } from "express";
import { incomeSchema } from "@/schemas/income";
import { createIncomeSchema } from "@/schemas/income/createIncome.schema";

export const incomeValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    const parsedBody = incomeSchema.parse(body);
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};
export const createIncomeValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    const parsedBody = createIncomeSchema.parse(body);
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};
