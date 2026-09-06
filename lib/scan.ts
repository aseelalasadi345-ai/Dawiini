// Shared shape for a scanned/extracted medication, used on both sides of
// POST /api/search/scan: the route returns this shape, and the scan results
// page + lib/mappers/scan.ts consume it. Previously lived in
// lib/mock/scanResults.ts alongside a random-outcome mock generator; that
// generator is gone now that the route does real extraction, so this moved
// out of lib/mock/ to a name that doesn't imply it's fake data.
//
// sessionStorage key used to hand scanned medications from the scan results
// screen off to the Add Medication form for autofill.
export const SCAN_HANDOFF_KEY = "dawiini:scanned-medications";

export type ScanOutcome = "success" | "partial" | "failure";

export interface ScannedMedication {
  id: string; // client-generated (crypto.randomUUID()) — just a React key/identity, not a catalog or medication id
  name: string;
  quantity: string; // "" if not detected
  strength: string; // "" if not detected
  frequency: string; // "" if not detected
}

export interface ScanResult {
  outcome: ScanOutcome;
  medications: ScannedMedication[];
}
