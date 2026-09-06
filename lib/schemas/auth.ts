import { z } from "zod";

// Route-facing schemas for app/api/auth/* — the counterpart to
// lib/validations/auth.ts's form-facing schemas (which also validate
// confirmPassword, a field the API never receives).

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const signupRequestSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").regex(EMAIL_REGEX, "Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type SignupRequest = z.infer<typeof signupRequestSchema>;

export const loginRequestSchema = z.object({
  email: z.string().min(1, "Email is required").regex(EMAIL_REGEX, "Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const forgotPasswordRequestSchema = z.object({
  email: z.string().min(1, "Email is required").regex(EMAIL_REGEX, "Enter a valid email"),
  // Which locale to send the person back to once they click the emailed
  // link (see app/api/auth/forgot-password/route.ts's redirectTo) — this
  // route lives outside the [locale] segment, so it can't infer it from the
  // URL the way a page can.
  locale: z.enum(["en", "ar"]).default("en"),
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

export const resetPasswordRequestSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
