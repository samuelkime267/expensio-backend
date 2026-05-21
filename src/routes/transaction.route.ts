import {
  createTransaction,
  deleteTransaction,
  getTotal,
  getTransaction,
  updateTransaction,
  getTransactions,
} from "@/controllers/transaction";
import { isAuthenticated } from "@/middleware";
import { createTransactionValidator } from "@/validators/transaction.validator";
import { Router } from "express";

const transactionRouter = Router();

transactionRouter.get("/total", isAuthenticated, getTotal);
transactionRouter.get("/", isAuthenticated, getTransactions);
transactionRouter.post(
  "/",
  isAuthenticated,
  createTransactionValidator,
  createTransaction,
);
transactionRouter.get("/:id", isAuthenticated, getTransaction);
transactionRouter.put(
  "/:id",
  isAuthenticated,
  createTransactionValidator,
  updateTransaction,
);
transactionRouter.delete("/:id", isAuthenticated, deleteTransaction);

export default transactionRouter;
