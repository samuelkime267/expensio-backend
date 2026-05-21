import { NextFunction, Request, Response } from "express";
import { createTransactionSchema } from "@/schemas/transaction";

export const createTransactionValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    const parsedBody = createTransactionSchema.parse(body);
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};
