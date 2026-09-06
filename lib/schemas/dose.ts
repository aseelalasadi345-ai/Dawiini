import { z } from "zod";

export const DOSE_STATUSES = ["pending", "taken", "skipped"] as const;

export const updateDoseStatusSchema = z.object({
  status: z.enum(DOSE_STATUSES, {
    message: `status must be one of: ${DOSE_STATUSES.join(", ")}`,
  }),
});

export type UpdateDoseStatusInput = z.infer<typeof updateDoseStatusSchema>;

export const logAsNeededDoseSchema = z.object({
  medicationId: z.string().min(1, "medicationId is required"),
  // Any string Date.parse() can handle (e.g. a full ISO datetime). Optional
  // — defaults to now() in the route if omitted.
  takenAt: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "takenAt must be a valid date/time string",
    })
    .optional(),
});

export type LogAsNeededDoseInput = z.infer<typeof logAsNeededDoseSchema>;
