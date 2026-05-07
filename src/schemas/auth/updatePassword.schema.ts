import { z } from "zod";

export const resetPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const updatePasswordSchema = z.object({
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordSchemaType = z.infer<typeof updatePasswordSchema>;
