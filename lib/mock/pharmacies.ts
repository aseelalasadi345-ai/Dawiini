import { Pharmacy } from "@/lib/types";

const WEEKDAY_HOURS = [
  { days: "Saturday – Thursday", hours: "8:00 AM – 11:00 PM" },
  { days: "Friday", hours: "2:00 PM – 11:00 PM" },
];

const ALL_DAY_HOURS = [{ days: "Every day", hours: "Open 24 hours" }];

export const pharmacies: Pharmacy[] = [
  {
    id: "nahdi-al-olaya",
    name: "Al Nahdi Pharmacy — Olaya",
    address: "Olaya St, Riyadh",
    phone: "+966 11 234 1010",
    distanceKm: 0.8,
    isOpen: true,
    is24Hours: true,
    updatedMinutesAgo: 5,
    rating: 4.6,
    reviewCount: 210,
    hours: ALL_DAY_HOURS,
    availability: [
      { medicationName: "Paracetamol 500mg", level: "plenty" },
      { medicationName: "Amoxicillin 500mg", level: "plenty" },
      { medicationName: "Atorvastatin 40mg", level: "limited" },
    ],
    mapPosition: { top: "34%", left: "62%" },
  },
  {
    id: "dawaa-king-fahd",
    name: "Al Dawaa Pharmacy — King Fahd Rd",
    address: "King Fahd Road, Riyadh 11411",
    phone: "+966 11 234 2020",
    distanceKm: 0.3,
    isOpen: true,
    is24Hours: false,
    openUntil: "11 PM",
    updatedMinutesAgo: 12,
    rating: 4.8,
    reviewCount: 152,
    hours: WEEKDAY_HOURS,
    availability: [
      { medicationName: "Paracetamol 500mg", level: "plenty" },
      { medicationName: "Paracetamol 1000mg", level: "limited" },
      { medicationName: "Amoxicillin 500mg", level: "out_of_stock" },
    ],
    mapPosition: { top: "50%", left: "50%" },
  },
  {
    id: "boots-tahlia",
    name: "Boots Pharmacy — Tahlia St",
    address: "Tahlia St, Riyadh",
    phone: "+966 11 234 3030",
    distanceKm: 2.1,
    isOpen: false,
    is24Hours: false,
    updatedMinutesAgo: 300,
    rating: 4.3,
    reviewCount: 98,
    hours: WEEKDAY_HOURS,
    availability: [
      { medicationName: "Paracetamol 500mg", level: "limited" },
      { medicationName: "Voltaren 50mg", level: "plenty" },
    ],
    mapPosition: { top: "63%", left: "37%" },
  },
  {
    id: "united-malaz",
    name: "United Pharmacy — Malaz",
    address: "Malaz, Riyadh",
    phone: "+966 11 234 4040",
    distanceKm: 1.1,
    isOpen: true,
    is24Hours: false,
    openUntil: "10 PM",
    updatedMinutesAgo: 120,
    rating: 4.1,
    reviewCount: 64,
    hours: WEEKDAY_HOURS,
    availability: [
      { medicationName: "Paracetamol 500mg", level: "out_of_stock" },
      { medicationName: "Metformin 850mg", level: "plenty" },
    ],
    mapPosition: { top: "37%", left: "82%" },
  },
  {
    id: "nahdi-malaz",
    name: "Al Nahdi Pharmacy — Malaz Branch",
    address: "King Faisal St, Malaz, Riyadh",
    phone: "+966 11 234 5050",
    distanceKm: 0.9,
    isOpen: true,
    is24Hours: false,
    openUntil: "12 AM",
    updatedMinutesAgo: 20,
    rating: 4.5,
    reviewCount: 133,
    hours: WEEKDAY_HOURS,
    availability: [
      { medicationName: "Paracetamol 500mg", level: "plenty" },
      { medicationName: "Ramipril 5mg", level: "limited" },
    ],
    mapPosition: { top: "77%", left: "47%" },
  },
  {
    id: "green-crescent-tahlia",
    name: "Green Crescent Pharmacy — Tahlia St",
    address: "Tahlia St, Riyadh",
    phone: "+966 11 234 6060",
    distanceKm: 1.6,
    isOpen: false,
    is24Hours: false,
    updatedMinutesAgo: 480,
    rating: 3.9,
    reviewCount: 41,
    hours: WEEKDAY_HOURS,
    availability: [
      { medicationName: "Paracetamol 500mg", level: "out_of_stock" },
      { medicationName: "Augmentin 625mg", level: "out_of_stock" },
    ],
    mapPosition: { top: "20%", left: "22%" },
  },
];

export function getPharmacy(id: string): Pharmacy | undefined {
  return pharmacies.find((pharmacy) => pharmacy.id === id);
}

export function pharmacyHasStock(pharmacy: Pharmacy): boolean {
  return pharmacy.availability.some((a) => a.level !== "out_of_stock");
}
