import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "identifierRequired")
    .refine(
      (val) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || // email
        /^\+?[0-9\s]{7,15}$/.test(val), // phone
      { message: "identifierInvalid" }
    ),
  password: z.string().min(6, "passwordTooShort"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;