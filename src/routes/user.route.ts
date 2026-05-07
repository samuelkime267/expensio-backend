import { getMe } from "@/controllers/user";
import { isAuthenticated } from "@/middleware";
import { Router } from "express";

const userRouter = Router();

userRouter.get("/me", isAuthenticated, getMe);

export default userRouter;
