import { z } from "zod";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emailSchema = z
  .string()
  .min(1, "emailRequired")
  .regex(EMAIL_REGEX, "emailInvalid");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "passwordRequired"),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    firstName: z.string().trim().min(1, "nameRequired"),
    lastName: z.string().trim().min(1, "nameRequired"),
    email: emailSchema,
    password: z.string().min(8, "passwordTooShort"),
    confirmPassword: z.string().min(1, "confirmPasswordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
