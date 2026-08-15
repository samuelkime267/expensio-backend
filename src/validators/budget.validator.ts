import { NextFunction, Request, Response } from "express";
import {
  createBudgetSchema,
  moveMoneySchema,
  updateBudgetSchema,
} from "@/schemas/budget";

export const createBudgetValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    const parsedBody = createBudgetSchema.parse(body);
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};

export const updateBudgetValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    const parsedBody = updateBudgetSchema.parse(body);
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};

export const moveMoneyValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    const parsedBody = moveMoneySchema.parse(body);
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};
