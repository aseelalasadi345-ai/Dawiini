import {
  Frequency,
  MedicationFormValues,
  defaultTimesFor,
} from "@/lib/schemas/medication";
import { ScannedMedication } from "@/lib/mock/scanResults";

function guessFrequency(text: string): Frequency {
  const normalized = text.toLowerCase();
  if (normalized.includes("twice") || normalized.includes("two times")) {
    return "twice_daily";
  }
  if (normalized.includes("three") || normalized.includes("3 times")) {
    return "three_times_daily";
  }
  if (normalized.includes("weekly")) {
    return "weekly";
  }
  if (normalized.includes("as needed") || normalized.includes("prn")) {
    return "as_needed";
  }
  // Covers "once daily", "once daily at night", and anything the scan
  // couldn't read — a safe starting point the user can change.
  return "once_daily";
}

export function scannedMedicationToFormValues(
  scanned: ScannedMedication,
): MedicationFormValues {
  const frequency = guessFrequency(scanned.frequency);
  return {
    medicationName: scanned.name,
    dosage: scanned.strength,
    frequency,
    times: defaultTimesFor(frequency),
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    notes: scanned.quantity
      ? `${scanned.quantity} (from scanned prescription)`
      : "",
  };
}
