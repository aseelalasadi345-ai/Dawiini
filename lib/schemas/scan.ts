import { z } from "zod";

// Validates Gemini's extraction JSON (app/api/search/scan/route.ts) before
// it's trusted. Fields are nullable, not optional-with-a-default: we need to
// tell "Gemini found this field but it was blank" (shouldn't happen, and
// min(1) below rejects it if it does) apart from "Gemini couldn't read this
// field at all" (null) — the frontend leaves the latter genuinely empty
// rather than showing a false value.
const extractedMedicationSchema = z.object({
  name: z.string().trim().min(1).nullable(),
  strength: z.string().trim().min(1).nullable(),
  frequency: z.string().trim().min(1).nullable(),
  quantity: z.string().trim().min(1).nullable(),
});

export const scanExtractionSchema = z.object({
  // Capped at 10 — a sanity bound against a malformed/runaway response, not
  // a real product limit (no real prescription has more than a handful).
  medications: z.array(extractedMedicationSchema).max(10),
});

export type ExtractedMedication = z.infer<typeof extractedMedicationSchema>;
export type ScanExtractionResult = z.infer<typeof scanExtractionSchema>;
