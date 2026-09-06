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
    // Matches the UI's own stated rule (passwordHint: "Minimum 8 characters,
    // including a number.") — two separate checks so each shows its own
    // message rather than one generic "invalid password".
    password: z.string().min(8, "passwordTooShort").regex(/\d/, "passwordNeedsNumber"),
    confirmPassword: z.string().min(1, "confirmPasswordRequired"),
    agreeToTerms: z.boolean().refine((v) => v === true, { message: "agreeRequired" }),
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

// Same password rule as signupSchema above (min 8 chars + a number), reusing
// the same "passwordTooShort"/"passwordNeedsNumber"/"confirmPasswordRequired"/
// "passwordMismatch" error keys — a reset password isn't held to a different
// standard than a signup one.
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "passwordTooShort").regex(/\d/, "passwordNeedsNumber"),
    confirmPassword: z.string().min(1, "confirmPasswordRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordMismatch",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
