// sessionStorage key used to hand scanned medications from the scan results
// screen off to the Add Medication form for autofill.
export const SCAN_HANDOFF_KEY = "dawiini:scanned-medications";

export type ScanOutcome = "success" | "partial" | "failure";

export interface ScannedMedication {
  id: string; // matches a MedicationCatalogEntry id
  name: string;
  quantity: string; // e.g. "60 tablets"
  strength: string; // "" if not detected
  frequency: string; // "" if not detected
}

export interface ScanResult {
  outcome: ScanOutcome;
  medications: ScannedMedication[];
}

const DETECTED_MEDICATIONS: ScannedMedication[] = [
  {
    id: "metformin-850",
    name: "Metformin",
    quantity: "60 tablets",
    strength: "850mg",
    frequency: "Twice daily",
  },
  {
    id: "atorvastatin-40",
    name: "Atorvastatin",
    quantity: "30 tablets",
    strength: "40mg",
    frequency: "Once daily at night",
  },
  {
    id: "ramipril-5",
    name: "Ramipril",
    quantity: "30 tablets",
    strength: "5mg",
    frequency: "Once daily",
  },
];

// Simulates an OCR pass over the uploaded prescription. Mock only — picks a
// random outcome each time so the UI's success/partial/failure states are
// all reachable without a real scanning backend.
export function runMockScan(): ScanResult {
  const roll = Math.random();

  if (roll < 0.15) {
    return { outcome: "failure", medications: [] };
  }

  if (roll < 0.4) {
    return {
      outcome: "partial",
      medications: DETECTED_MEDICATIONS.map((med, i) =>
        i === DETECTED_MEDICATIONS.length - 1
          ? { ...med, strength: "", frequency: "" }
          : med,
      ),
    };
  }

  return { outcome: "success", medications: DETECTED_MEDICATIONS };
}
