import { NextFunction, Request, Response } from "express";
import { categorySchema } from "@/schemas/category";

export const categoryValidator = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { body } = req;
    const parsedBody = categorySchema.parse(body);
    req.body = parsedBody;
    next();
  } catch (error) {
    next(error);
  }
};
