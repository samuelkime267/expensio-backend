import {
  getExpense,
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/controllers/expense";
import { isAuthenticated } from "@/middleware";
import { createExpenseValidator } from "@/validators/expense.validator";
import { Router } from "express";

const expenseRouter = Router();

expenseRouter.get("/:id", isAuthenticated, getExpense);
expenseRouter.post("/", createExpenseValidator, isAuthenticated, createExpense);
expenseRouter.delete("/:id", isAuthenticated, deleteExpense);
expenseRouter.put(
  "/:id",
  createExpenseValidator,
  isAuthenticated,
  updateExpense,
);

export default expenseRouter;
