import { z } from "zod";

export const categorySchema = z.object({
  user: z.string().optional(), // ObjectId
  name: z.string("Name is required"),
  value: z.string("Value is required"),
  description: z.string().optional(),
  isIncome: z.boolean().default(false),
});

export type CategorySchemaType = z.infer<typeof categorySchema>;
