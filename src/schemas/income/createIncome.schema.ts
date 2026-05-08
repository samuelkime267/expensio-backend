import { z } from "zod";

export const createIncomeSchema = z.object({
  amount: z.number("Amount is required"),
  date: z.coerce.date(),
  category: z.string("Category is required"),
  description: z.string().optional(),
});

export type CreateIncomeSchemaType = z.infer<typeof createIncomeSchema>;
