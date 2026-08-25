import { z } from "zod";

export const FREQUENCIES = [
  "once_daily",
  "twice_daily",
  "three_times_daily",
  "as_needed",
  "weekly",
] as const;

export type Frequency = (typeof FREQUENCIES)[number];

// How many "Times" entries each frequency actually requires.
// as_needed doesn't require any fixed time.
export const REQUIRED_TIME_COUNT: Record<Frequency, number> = {
  once_daily: 1,
  twice_daily: 2,
  three_times_daily: 3,
  as_needed: 0,
  weekly: 1,
};

// Guards against "500", "abc mg", empty units, etc.
// Accepts: "500mg", "2.5 ml", "10 IU", "1 tablet"
const DOSAGE_REGEX =
  /^\d+(\.\d+)?\s?(mg|mcg|g|ml|iu|units?|tablets?|capsules?|drops?)$/i;

// Blocks names that are empty, only symbols, or absurdly long.
const NAME_REGEX = /^[\p{L}0-9][\p{L}0-9\s\-'/.]{1,79}$/u;

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time");

const isoDateSchema = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date");

export const medicationFormSchema = z
  .object({
    medicationName: z
      .string()
      .trim()
      .min(2, "Medication name is too short")
      .max(80, "Medication name is too long")
      .regex(NAME_REGEX, "Enter a valid medication name"),

    dosage: z
      .string()
      .trim()
      .min(1, "Dosage is required")
      .regex(DOSAGE_REGEX, 'Use a format like "500mg" or "2.5 ml"'),

    frequency: z.enum(FREQUENCIES, {
      message: "Select a frequency",
    }),

    times: z.array(timeSchema).default([]),

    startDate: isoDateSchema,
    endDate: z.string().optional().or(z.literal("")),

    notes: z
      .string()
      .trim()
      .max(500, "Notes must be under 500 characters")
      .optional(),
  })
  // times count must match what the frequency needs
  .superRefine((data, ctx) => {
    const required = REQUIRED_TIME_COUNT[data.frequency];

    if (data.times.length !== required) {
      ctx.addIssue({
        code: "custom",
        path: ["times"],
        message:
          required === 0
            ? "Times not required for this frequency"
            : `This frequency needs ${required} time${required > 1 ? "s" : ""}`,
      });
    }

    const uniqueTimes = new Set(data.times);
    if (uniqueTimes.size !== data.times.length) {
      ctx.addIssue({
        code: "custom",
        path: ["times"],
        message: "Remove duplicate times",
      });
    }
  })
  // end date, if present, must be after start date
  .superRefine((data, ctx) => {
    if (!data.endDate) return;
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "End date must be after start date",
      });
    }
  })
  // start date sanity check — not more than a week in the past
  .superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (start < oneWeekAgo) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Start date can't be more than a week in the past",
      });
    }
  });

export type MedicationFormValues = z.infer<typeof medicationFormSchema>;

// Staggered so switching frequency (or prefilling from a scan) never lands
// on duplicate times, which the superRefine above would reject.
export const DEFAULT_TIME_SLOTS = ["08:00", "14:00", "20:00"];

export function defaultTimesFor(frequency: Frequency): string[] {
  return DEFAULT_TIME_SLOTS.slice(0, REQUIRED_TIME_COUNT[frequency]);
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_times_daily: "Three times daily",
  as_needed: "As needed",
  weekly: "Weekly",
};
