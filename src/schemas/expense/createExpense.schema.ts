import { z } from "zod";

export const createExpenseSchema = z.object({
  amount: z.number("Amount is required"),
  date: z.coerce.date(),
  category: z.string("Category is required"),
  description: z.string().optional(),
});

export type CreateExpenseSchemaType = z.infer<typeof createExpenseSchema>;
