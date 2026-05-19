import { z } from "zod";

export const createExpenseSchema = z.object({
  name: z.string("Name is required"),
  amount: z.number("Amount is required"),
  date: z.coerce.date("Date is required"),
  category: z.string("Category is required"),
  description: z.string().optional(),
});

export type CreateExpenseSchemaType = z.infer<typeof createExpenseSchema>;
