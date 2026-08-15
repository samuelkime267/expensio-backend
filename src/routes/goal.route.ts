import {
  contributeToGoal,
  createGoal,
  deleteGoal,
  getGoals,
  updateGoal,
} from "@/controllers/goal";
import { isAuthenticated } from "@/middleware";
import {
  contributeGoalValidator,
  createGoalValidator,
  updateGoalValidator,
} from "@/validators/goal.validator";
import { Router } from "express";

const goalRouter = Router();

goalRouter.get("/", isAuthenticated, getGoals);
goalRouter.post("/", isAuthenticated, createGoalValidator, createGoal);
goalRouter.post(
  "/:id/contribute",
  isAuthenticated,
  contributeGoalValidator,
  contributeToGoal,
);
goalRouter.put("/:id", isAuthenticated, updateGoalValidator, updateGoal);
goalRouter.delete("/:id", isAuthenticated, deleteGoal);

export default goalRouter;
