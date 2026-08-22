"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { SavedMedication } from "@/lib/types";
import { medicationCatalog } from "@/lib/mock/medicationCatalog";

function toSavedMedication(id: string): SavedMedication {
  const entry = medicationCatalog.find((e) => e.id === id)!;
  return {
    id: entry.id,
    name: entry.name,
    dose: entry.strengths[0],
    brand: entry.brand,
    useCase: entry.useCase,
  };
}

const initialSavedMedications: SavedMedication[] = [
  toSavedMedication("panadol-extra"),
  toSavedMedication("amoxil-500"),
];

interface SavedMedicationsContextValue {
  savedMedications: SavedMedication[];
  isSaved: (id: string) => boolean;
  toggleSaved: (medication: SavedMedication) => void;
  unsaveMedication: (id: string) => void;
}

const SavedMedicationsContext =
  createContext<SavedMedicationsContextValue | null>(null);

export function SavedMedicationsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedMedications, setSavedMedications] = useState<SavedMedication[]>(
    initialSavedMedications,
  );

  function isSaved(id: string) {
    return savedMedications.some((m) => m.id === id);
  }

  function toggleSaved(medication: SavedMedication) {
    setSavedMedications((prev) =>
      prev.some((m) => m.id === medication.id)
        ? prev.filter((m) => m.id !== medication.id)
        : [...prev, medication],
    );
  }

  function unsaveMedication(id: string) {
    setSavedMedications((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <SavedMedicationsContext.Provider
      value={{ savedMedications, isSaved, toggleSaved, unsaveMedication }}
    >
      {children}
    </SavedMedicationsContext.Provider>
  );
}

export function useSavedMedications() {
  const ctx = useContext(SavedMedicationsContext);
  if (!ctx) {
    throw new Error(
      "useSavedMedications must be used within SavedMedicationsProvider",
    );
  }
  return ctx;
}
