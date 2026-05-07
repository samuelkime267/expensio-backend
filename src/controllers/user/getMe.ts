import { NextFunction, Request, Response } from "express";

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.status(200).json({
    message: "User retrieved successfully",
    success: true,
    data: req.user,
  });
};
