import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  googleOAuthCallback,
  googleOAuthLogin,
  sendVerificationEmail,
  verifyEmail,
  sendResetPasswordLink,
  resetPassword,
} from "@/controllers/auth";
import {
  loginValidator,
  registerValidator,
  sendResetPasswordLinkValidator,
  updatePasswordValidator,
} from "@/validators/auth.validator";
import { isValidRefreshToken, isAuthenticated } from "@/middleware";

const authRouter = Router();

authRouter.post("/register", registerValidator, register);
authRouter.post("/login", loginValidator, login);
authRouter.post("/logout", isAuthenticated, isValidRefreshToken, logout);
authRouter.post("/refresh-token", isValidRefreshToken, refreshToken);
authRouter.get("/google", googleOAuthLogin);
authRouter.get("/google/callback", googleOAuthCallback);
authRouter.post("/verify-email", isAuthenticated, sendVerificationEmail);
authRouter.get("/verify-email/:token", isAuthenticated, verifyEmail);

authRouter.post(
  "/forgot-password",
  sendResetPasswordLinkValidator,
  sendResetPasswordLink,
);
authRouter.post(
  "/reset-password/:token",
  updatePasswordValidator,
  resetPassword,
);

export default authRouter;
