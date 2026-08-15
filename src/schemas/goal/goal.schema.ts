import { z } from "zod";

export const createGoalSchema = z.object({
  name: z.string("Name is required"),
  targetAmount: z.number("Target amount is required").positive(),
  targetDate: z.coerce
    .date("Target date is required")
    .refine((date) => date > new Date(), {
      message: "Target date must be in the future",
    }),
});

export const updateGoalSchema = z.object({
  name: z.string("Name is required"),
  targetAmount: z.number("Target amount is required").positive(),
  targetDate: z.coerce.date("Target date is required"),
  monthlyContribution: z
    .number("Monthly contribution is required")
    .min(0),
});

export const contributeGoalSchema = z.object({
  amount: z.number("Amount is required").positive(),
});

export type CreateGoalSchemaType = z.infer<typeof createGoalSchema>;
export type UpdateGoalSchemaType = z.infer<typeof updateGoalSchema>;
export type ContributeGoalSchemaType = z.infer<
  typeof contributeGoalSchema
>;
