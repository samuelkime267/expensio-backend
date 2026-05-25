import { z } from "zod";

const transactionType = z.enum(["Income", "Expense"]);

export const createTransactionSchema = z.object({
  name: z.string("Name is required"),
  amount: z.number("Amount is required"),
  date: z.coerce.date("Date is required").refine((date) => date <= new Date(), {
    message: "Date cannot be in the future",
  }),
  category: z.string("Category is required"),
  description: z.string().optional(),
  type: transactionType,
});

export type CreateTransactionSchemaType = z.infer<
  typeof createTransactionSchema
>;
