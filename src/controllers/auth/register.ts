import { NextFunction, Request, Response } from "express";
import { RegisterSchemaType } from "@/schemas/auth";
import User from "@/models/user.model";
import { CustomError } from "@/types";
import { generateJwtToken } from "@/utils";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { email, name, username, password } = req.body as RegisterSchemaType;
    const existingUserEmail = await User.findOne({ email });
    const existingUserUsername = await User.findOne({ username });

    if (existingUserEmail) {
      const error = new Error() as CustomError;
      error.message = "User with given email already exists";
      error.statusCode = 400;
      throw error;
    }
    if (existingUserUsername) {
      const error = new Error() as CustomError;
      error.message = "User with given username already exists";
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      name,
      username,
      password: hashedPassword,
    });

    const token = generateJwtToken(user._id);

    await session.commitTransaction();
    session.endSession();

    res
      .cookie("refreshToken", token.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: "/api/v1/auth",
      })
      .status(201)
      .json({
        message: "User created successfully",
        success: true,
        data: { user, token },
      });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
