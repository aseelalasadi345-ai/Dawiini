"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Medication } from "@/lib/types";

const mockMedications: Medication[] = [
  {
    id: "1",
    name: "Metformin",
    dose: "850mg",
    frequency: "twice_daily",
    times: ["08:00", "20:00"],
    startDate: "2025-01-01",
  },
  {
    id: "2",
    name: "Omeprazole",
    dose: "20mg",
    frequency: "once_daily",
    times: ["08:00"],
    startDate: "2025-03-15",
    notes: "Take before meals",
  },
  {
    id: "3",
    name: "Atorvastatin",
    dose: "40mg",
    frequency: "once_daily",
    times: ["21:00"],
    startDate: "2025-06-01",
    notes: "Take at bedtime",
  },
];

interface MedicationsContextValue {
  medications: Medication[];
  addMedication: (medication: Medication) => void;
  updateMedication: (medication: Medication) => void;
  deleteMedication: (id: string) => void;
}

const MedicationsContext = createContext<MedicationsContextValue | null>(
  null,
);

export function MedicationsProvider({ children }: { children: ReactNode }) {
  const [medications, setMedications] =
    useState<Medication[]>(mockMedications);

  function addMedication(medication: Medication) {
    setMedications((prev) => [...prev, medication]);
  }

  function updateMedication(updated: Medication) {
    setMedications((prev) =>
      prev.map((m) => (m.id === updated.id ? updated : m)),
    );
  }

  function deleteMedication(id: string) {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <MedicationsContext.Provider
      value={{ medications, addMedication, updateMedication, deleteMedication }}
    >
      {children}
    </MedicationsContext.Provider>
  );
}

export function useMedications() {
  const ctx = useContext(MedicationsContext);
  if (!ctx) {
    throw new Error("useMedications must be used within MedicationsProvider");
  }
  return ctx;
}
