import { getBalance, getMe } from "@/controllers/user";
import { isAuthenticated } from "@/middleware";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/me", isAuthenticated, getMe);
userRouter.get("/balance", isAuthenticated, getBalance);

export default userRouter;
