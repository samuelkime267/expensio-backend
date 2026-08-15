import {
  createBudget,
  deleteBudget,
  getBudget,
  getSuggestions,
  moveMoney,
  updateBudget,
} from "@/controllers/budget";
import { isAuthenticated } from "@/middleware";
import {
  createBudgetValidator,
  moveMoneyValidator,
  updateBudgetValidator,
} from "@/validators/budget.validator";
import { Router } from "express";

const budgetRouter = Router();

budgetRouter.get("/", isAuthenticated, getBudget);
budgetRouter.get("/suggestions", isAuthenticated, getSuggestions);
budgetRouter.post("/", isAuthenticated, createBudgetValidator, createBudget);
budgetRouter.put("/:id", isAuthenticated, updateBudgetValidator, updateBudget);
budgetRouter.delete("/:id", isAuthenticated, deleteBudget);
budgetRouter.post(
  "/:id/move",
  isAuthenticated,
  moveMoneyValidator,
  moveMoney,
);

export default budgetRouter;
