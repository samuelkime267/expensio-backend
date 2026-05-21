import { UserDocument } from "@/models/user.model";
import { NextFunction, Request, Response } from "express";

export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user as UserDocument;

  res.status(200).json({
    message: "User retrieved successfully",
    success: true,
    data: {
      balance: user.balance,
    },
  });
};
