import { Medication } from "@/lib/types";
import { MedicationFormValues } from "@/lib/schemas/medication";
import type { IMedication } from "@/interfaces/interfaces";

// GET /api/medications/mine (and POST/PATCH's responses) return IMedication
// — nullable endDate/notes, matching the Prisma columns directly. The rest
// of the app (EditMedicationModal, SetReminderModal, formatMedicationSince,
// FREQUENCY_LABELS, ...) already works against lib/types.ts's `Medication`
// (optional/undefined instead of null), so pages map at the query boundary
// rather than changing every consumer to accept both shapes.
export function apiMedicationToMedication(medication: IMedication): Medication {
  return {
    id: medication.id,
    name: medication.name,
    dose: medication.dose,
    frequency: medication.frequency,
    times: medication.times,
    startDate: medication.startDate,
    endDate: medication.endDate ?? undefined,
    notes: medication.notes ?? undefined,
  };
}

export function medicationToFormValues(
  medication: Medication,
): MedicationFormValues {
  return {
    medicationName: medication.name,
    dosage: medication.dose,
    frequency: medication.frequency,
    times: medication.times,
    startDate: medication.startDate,
    endDate: medication.endDate ?? "",
    notes: medication.notes ?? "",
  };
}

export function formatMedicationSince(startDate: string): string {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return startDate;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
