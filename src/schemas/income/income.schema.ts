import { z } from "zod";

export const incomeSchema = z.object({
  user: z.string("User is required"), // ObjectId
  amount: z.number("Amount is required"),
  date: z.coerce.date(),
  category: z.string("Category is required"),
  description: z.string().optional(),
});

export type IncomeSchemaType = z.infer<typeof incomeSchema>;
