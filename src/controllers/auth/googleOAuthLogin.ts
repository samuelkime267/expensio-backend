import { NextFunction, Request, Response } from "express";
import passport from "passport";

export const googleOAuthLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};
