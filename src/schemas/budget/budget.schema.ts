import { z } from "zod";

const budgetItemSchema = z.object({
  category: z.string("Category is required"),
  amount: z.number("Amount is required").min(0),
  type: z.enum(["FIXED", "FLEXIBLE", "GOAL"]).default("FLEXIBLE"),
});

export const createBudgetSchema = z.object({
  year: z.number("Year is required").int(),
  month: z.number("Month is required").int().min(1).max(12),
  income: z.number("Income is required").min(0),
  items: z
    .array(budgetItemSchema)
    .min(1, "Add at least one budget item"),
});

export const updateBudgetSchema = z.object({
  income: z.number("Income is required").min(0),
  items: z
    .array(budgetItemSchema)
    .min(1, "Add at least one budget item"),
});

export const moveMoneySchema = z.object({
  fromValue: z.string("From category is required"),
  toValue: z.string("To category is required"),
  amount: z.number("Amount is required").positive(),
});

export type CreateBudgetSchemaType = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetSchemaType = z.infer<typeof updateBudgetSchema>;
export type MoveMoneySchemaType = z.infer<typeof moveMoneySchema>;
