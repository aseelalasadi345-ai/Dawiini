import { MedicationCatalogEntry } from "@/lib/types";

export const medicationCatalog: MedicationCatalogEntry[] = [
  {
    id: "panadol-extra",
    name: "Panadol Extra",
    genericName: "Paracetamol + Caffeine",
    brand: "GSK",
    useCase: "Pain relief",
    categories: ["Pain Relief", "Fever"],
    strengths: ["250mg", "500mg", "1000mg"],
    forms: ["Tablet", "Syrup", "Suppository"],
    description:
      "Used for the relief of mild to moderate pain such as headache, toothache, and fever.",
    disclaimer:
      "This information is for general guidance only and does not replace advice from a doctor or pharmacist.",
    pharmacies: [
      {
        pharmacyId: "nahdi-al-olaya",
        name: "Al Nahdi Pharmacy — Olaya",
        distance: "0.8 km",
        isOpen: true,
        status: "in_stock",
      },
      {
        pharmacyId: "dawaa-king-fahd",
        name: "Al Dawaa Pharmacy — King Fahd Rd",
        distance: "1.4 km",
        isOpen: true,
        status: "out_of_stock",
      },
      {
        pharmacyId: "boots-tahlia",
        name: "Boots Pharmacy — Tahlia St",
        distance: "2.1 km",
        isOpen: false,
        status: "in_stock",
      },
    ],
  },
  {
    id: "amoxil-500",
    name: "Amoxil",
    genericName: "Amoxicillin",
    brand: "GSK",
    useCase: "Bacterial infections",
    categories: ["Antibiotic"],
    strengths: ["250mg", "500mg"],
    forms: ["Tablet", "Syrup"],
    description:
      "A penicillin-type antibiotic used to treat a variety of bacterial infections.",
    disclaimer:
      "Only take antibiotics as prescribed by your doctor. Complete the full course even if you feel better.",
    pharmacies: [
      {
        pharmacyId: "nahdi-al-olaya",
        name: "Al Nahdi Pharmacy — Olaya",
        distance: "0.8 km",
        isOpen: true,
        status: "in_stock",
      },
      {
        pharmacyId: "united-malaz",
        name: "United Pharmacy — Malaz",
        distance: "3.2 km",
        isOpen: true,
        status: "in_stock",
      },
    ],
  },
  {
    id: "augmentin-625",
    name: "Augmentin",
    genericName: "Amoxicillin/Clavulanate",
    brand: "GSK",
    useCase: "Bacterial infections",
    categories: ["Antibiotic"],
    strengths: ["375mg", "625mg", "1g"],
    forms: ["Tablet", "Syrup"],
    description:
      "A combination antibiotic used to treat a wider range of bacterial infections than amoxicillin alone.",
    disclaimer:
      "Only take antibiotics as prescribed by your doctor. Complete the full course even if you feel better.",
    pharmacies: [
      {
        pharmacyId: "dawaa-king-fahd",
        name: "Al Dawaa Pharmacy — King Fahd Rd",
        distance: "1.4 km",
        isOpen: true,
        status: "in_stock",
      },
      {
        pharmacyId: "boots-tahlia",
        name: "Boots Pharmacy — Tahlia St",
        distance: "2.1 km",
        isOpen: false,
        status: "out_of_stock",
      },
    ],
  },
  {
    id: "metformin-850",
    name: "Metformin",
    genericName: "Metformin Hydrochloride",
    brand: "Generic",
    useCase: "Type 2 diabetes",
    categories: ["Diabetes"],
    strengths: ["500mg", "850mg", "1000mg"],
    forms: ["Tablet"],
    description:
      "Used to control high blood sugar levels in people with type 2 diabetes.",
    disclaimer:
      "This information is for general guidance only and does not replace advice from a doctor or pharmacist.",
    pharmacies: [
      {
        pharmacyId: "nahdi-al-olaya",
        name: "Al Nahdi Pharmacy — Olaya",
        distance: "0.8 km",
        isOpen: true,
        status: "in_stock",
      },
      {
        pharmacyId: "united-malaz",
        name: "United Pharmacy — Malaz",
        distance: "3.2 km",
        isOpen: true,
        status: "in_stock",
      },
    ],
  },
  {
    id: "atorvastatin-40",
    name: "Atorvastatin",
    genericName: "Atorvastatin Calcium",
    brand: "Generic",
    useCase: "Cholesterol control",
    categories: ["Cholesterol"],
    strengths: ["10mg", "20mg", "40mg", "80mg"],
    forms: ["Tablet"],
    description:
      "Used to lower cholesterol and reduce the risk of heart disease and stroke.",
    disclaimer:
      "This information is for general guidance only and does not replace advice from a doctor or pharmacist.",
    pharmacies: [
      {
        pharmacyId: "dawaa-king-fahd",
        name: "Al Dawaa Pharmacy — King Fahd Rd",
        distance: "1.4 km",
        isOpen: true,
        status: "in_stock",
      },
      {
        pharmacyId: "boots-tahlia",
        name: "Boots Pharmacy — Tahlia St",
        distance: "2.1 km",
        isOpen: false,
        status: "out_of_stock",
      },
    ],
  },
  {
    id: "ramipril-5",
    name: "Ramipril",
    genericName: "Ramipril",
    brand: "Generic",
    useCase: "Blood pressure control",
    categories: ["Blood Pressure"],
    strengths: ["2.5mg", "5mg", "10mg"],
    forms: ["Tablet"],
    description:
      "Used to treat high blood pressure and reduce the risk of heart attack or stroke.",
    disclaimer:
      "This information is for general guidance only and does not replace advice from a doctor or pharmacist.",
    pharmacies: [
      {
        pharmacyId: "nahdi-al-olaya",
        name: "Al Nahdi Pharmacy — Olaya",
        distance: "0.8 km",
        isOpen: true,
        status: "in_stock",
      },
    ],
  },
  {
    id: "voltaren-50",
    name: "Voltaren",
    genericName: "Diclofenac Sodium",
    brand: "Novartis",
    useCase: "Inflammation & pain",
    categories: ["Pain Relief", "Anti-inflammatory"],
    strengths: ["25mg", "50mg", "75mg"],
    forms: ["Tablet", "Suppository"],
    description:
      "A nonsteroidal anti-inflammatory drug (NSAID) used to reduce inflammation and relieve pain.",
    disclaimer:
      "This information is for general guidance only and does not replace advice from a doctor or pharmacist.",
    pharmacies: [
      {
        pharmacyId: "united-malaz",
        name: "United Pharmacy — Malaz",
        distance: "3.2 km",
        isOpen: true,
        status: "in_stock",
      },
    ],
  },
];

export function getMedicationCatalogEntry(
  id: string,
): MedicationCatalogEntry | undefined {
  return medicationCatalog.find((entry) => entry.id === id);
}

// Matches a medication from the user's own regimen (Medication.name, e.g.
// "Metformin") to its catalog entry (MedicationCatalogEntry.id, e.g.
// "metformin-850") so pages that only know the catalog id — like the
// pharmacies list's ?medicationId= filter — can be reached from "My
// Medications". Falls back to undefined for regimen entries with no
// matching catalog entry (the catalog is a small curated sample).
export function findMedicationCatalogEntryByName(
  name: string,
): MedicationCatalogEntry | undefined {
  const normalized = name.trim().toLowerCase();
  return medicationCatalog.find(
    (entry) => entry.name.toLowerCase() === normalized,
  );
}
