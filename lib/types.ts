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

export type PharmacyStockStatus = "in_stock" | "out_of_stock";

export interface PharmacyStock {
  pharmacyId: string;
  name: string;
  distance: string; // e.g. "0.8 km"
  isOpen: boolean;
  status: PharmacyStockStatus;
}

// A browsable drug-reference entry (search results, saved items) — distinct
// from `Medication`, which represents the user's own active regimen.
export interface MedicationCatalogEntry {
  id: string;
  name: string; // brand name, e.g. "Panadol Extra"
  genericName: string; // e.g. "Paracetamol + Caffeine"
  brand: string;
  useCase: string;
  categories: string[];
  strengths: string[]; // e.g. ["250mg", "500mg", "1000mg"]
  forms: string[]; // e.g. ["Tablet", "Syrup", "Suppository"]
  description: string;
  disclaimer: string;
  pharmacies: PharmacyStock[];
}

// A bookmarked catalog entry, as shown on the Saved tab.
export interface SavedMedication {
  id: string;
  name: string;
  dose: string;
  brand: string;
  useCase: string;
}
