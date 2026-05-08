import {
  createIncome,
  getIncome,
  deleteIncome,
  updateIncome,
} from "@/controllers/income";
import { isAuthenticated } from "@/middleware";
import { createIncomeValidator } from "@/validators/income.validator";
import { Router } from "express";

const incomeRouter = Router();

incomeRouter.get("/:id", isAuthenticated, getIncome);
incomeRouter.post("/", createIncomeValidator, isAuthenticated, createIncome);
incomeRouter.delete("/:id", isAuthenticated, deleteIncome);
incomeRouter.put("/:id", createIncomeValidator, isAuthenticated, updateIncome);

export default incomeRouter;
