import { Frequency } from "./schemas/medication";

export type DoseStatus = "pending" | "taken" | "skipped";

export interface Dose {
  id: string;
  medicationName: string;
  dose: string; // e.g. "850mg"
  time: string; // e.g. "08:00"
  status: DoseStatus;
}

export interface Medication {
  id: string;
  name: string; // e.g. "Metformin"
  dose: string; // e.g. "850mg"
  frequency: Frequency;
  times: string[]; // e.g. ["08:00", "20:00"]
  startDate: string; // ISO date, e.g. "2025-01-01"
  endDate?: string; // ISO date
  notes?: string;
}

// MedicationCatalogEntry/PharmacyStock (the mock drug-reference shapes) and
// real pharmacies (prisma/schema.prisma: Pharmacy) are both queried directly
// via Prisma now — no client-side type for either lives here anymore. They
// were removed along with lib/mock/medicationCatalog.ts and
// lib/mock/pharmacies.ts.
