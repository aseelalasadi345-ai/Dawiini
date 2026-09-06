import { z } from "zod";

// Client-side field validation for the Personal Info / Health Info forms —
// gives immediate, translatable, per-field feedback (same pattern as
// lib/validations/auth.ts: message values are i18n keys, resolved via
// useTranslations("profile.errors") the way SignupForm resolves
// auth.errors). This does NOT replace the server-side checks in
// lib/schemas/profile.ts — a request can always be crafted by hand — it
// just stops obviously-garbage values (e.g. "edjndejkndjkL" as a date of
// birth, "h6t4w" as a weight) from ever reaching the API in the first place.

const DATE_OF_BIRTH_REGEX = /^\d{4}-\d{2}-\d{2}$/;
// Digits, spaces and dashes, with an optional leading +. Deliberately loose
// (no country-specific format) — this app has users across locales/regions.
const PHONE_REGEX = /^\+?[0-9\s-]{6,20}$/;
const DECIMAL_REGEX = /^\d+(\.\d+)?$/;

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

export const personalProfileFormSchema = z.object({
  dateOfBirth: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || DATE_OF_BIRTH_REGEX.test(v), "dateOfBirthInvalid")
    .refine((v) => {
      if (!v || !DATE_OF_BIRTH_REGEX.test(v)) return true;
      const date = new Date(v);
      return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
    }, "dateOfBirthFuture"),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || PHONE_REGEX.test(v), "phoneInvalid"),
});

export type PersonalProfileFormValues = z.infer<typeof personalProfileFormSchema>;

export const healthProfileFormSchema = z.object({
  weightKg: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (DECIMAL_REGEX.test(v) && Number(v) > 0 && Number(v) <= 500), "weightInvalid"),
  heightCm: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (DECIMAL_REGEX.test(v) && Number(v) > 0 && Number(v) <= 300), "heightInvalid"),
  bloodType: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (BLOOD_TYPES as readonly string[]).includes(v), "bloodTypeInvalid"),
  allergies: z.string().trim().max(500).optional(),
  chronicConditions: z.string().trim().max(500).optional(),
});

export type HealthProfileFormValues = z.infer<typeof healthProfileFormSchema>;
