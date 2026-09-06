import { z } from "zod";

// Route-facing schemas for PUT /api/profile/{personal,health,settings}.
// Every field is optional — each PUT partially updates its section (the
// caller sends only the fields the user actually changed), upserted onto a
// PersonalProfile/HealthProfile/UserSettings row that may not exist yet.
//
// The format checks below mirror lib/validations/profile.ts (the
// react-hook-form schemas the Personal Info / Health Info forms validate
// against before ever submitting) — that client-side copy is what a real
// user hits first, but this server copy is the one that actually matters:
// the client form only stops the UI from sending garbage, it can't stop a
// hand-crafted request. Before this, e.g. dateOfBirth: "edjndejkndjkL" or
// weightKg: "h6t4w" were accepted and persisted as-is (any non-empty string
// under the length cap passed).

const DATE_OF_BIRTH_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PHONE_REGEX = /^\+?[0-9\s-]{6,20}$/;
const DECIMAL_REGEX = /^\d+(\.\d+)?$/;

export const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

const dateOfBirthField = z
  .string()
  .trim()
  .max(40)
  .optional()
  .refine((v) => !v || DATE_OF_BIRTH_REGEX.test(v), "Date of birth must be a valid date (YYYY-MM-DD).")
  .refine((v) => {
    if (!v || !DATE_OF_BIRTH_REGEX.test(v)) return true;
    const date = new Date(v);
    return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
  }, "Date of birth can't be in the future.");

const phoneField = (label: string) =>
  z
    .string()
    .trim()
    .max(40)
    .optional()
    .refine((v) => !v || PHONE_REGEX.test(v), `${label} can only contain digits, spaces, - and a leading +.`);

export const personalProfileSchema = z.object({
  dateOfBirth: dateOfBirthField,
  phone: phoneField("Phone"),
});

export type PersonalProfileRequest = z.infer<typeof personalProfileSchema>;

export const healthProfileSchema = z.object({
  weightKg: z
    .string()
    .trim()
    .max(20)
    .optional()
    .refine((v) => !v || (DECIMAL_REGEX.test(v) && Number(v) > 0 && Number(v) <= 500), "Weight must be a number between 1 and 500 kg."),
  heightCm: z
    .string()
    .trim()
    .max(20)
    .optional()
    .refine((v) => !v || (DECIMAL_REGEX.test(v) && Number(v) > 0 && Number(v) <= 300), "Height must be a number between 1 and 300 cm."),
  bloodType: z
    .string()
    .trim()
    .max(10)
    .optional()
    .refine((v) => !v || (BLOOD_TYPES as readonly string[]).includes(v), "Blood type must be one of A+, A-, B+, B-, AB+, AB-, O+, O-."),
  allergies: z.string().trim().max(500).optional(),
  chronicConditions: z.string().trim().max(500).optional(),
  emergencyContactName: z.string().trim().max(120).optional(),
  emergencyContactPhone: phoneField("Emergency contact phone"),
});

export type HealthProfileRequest = z.infer<typeof healthProfileSchema>;

export const settingsSchema = z.object({
  doseReminders: z.boolean().optional(),
  stockAlerts: z.boolean().optional(),
  pharmacyUpdates: z.boolean().optional(),
  locale: z.enum(["en", "ar"]).optional(),
});

export type SettingsRequest = z.infer<typeof settingsSchema>;
