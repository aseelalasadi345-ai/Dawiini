import { Medication } from "@/lib/types";
import { MedicationFormValues } from "@/lib/schemas/medication";

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

export function formValuesToMedication(
  values: MedicationFormValues,
  id: string,
): Medication {
  return {
    id,
    name: values.medicationName,
    dose: values.dosage,
    frequency: values.frequency,
    times: values.times,
    startDate: values.startDate,
    endDate: values.endDate || undefined,
    notes: values.notes,
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
