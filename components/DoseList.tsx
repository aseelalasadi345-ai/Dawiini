"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type Dose = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

const initialDoses: Dose[] = [
  { id: "1", name: "Metformin 850mg", time: "08:00", taken: true },
  { id: "2", name: "Omeprazole 20mg", time: "13:00", taken: false },
  { id: "3", name: "Atorvastatin 40mg", time: "21:00", taken: false },
];

export default function DoseList() {
  const t = useTranslations("home");
  const [doses, setDoses] = useState(initialDoses);

  const markTaken = (id: string) =>
    setDoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, taken: true } : d)),
    );

  return (
    <div className="space-y-3">
      {doses.map((dose) => (
        <div
          key={dose.id}
          className={`flex items-center gap-3 p-3 rounded-xl ${dose.taken ? "bg-gray-50 opacity-60" : "bg-blue-50/50"}`}
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${dose.taken ? "bg-emerald-100" : "bg-white border border-[#E5E9F0]"}`}
          >
            {dose.taken ? "✓" : "💊"}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`text-sm font-medium ${dose.taken ? "text-[#8A94A6] line-through" : "text-[#0F1B34]"}`}
            >
              {dose.name}
            </div>
            <div className="text-xs text-[#8A94A6]">{dose.time}</div>
          </div>
          {!dose.taken && (
            <div className="flex gap-1.5">
              <button
                onClick={() => markTaken(dose.id)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#2563EB] text-white"
              >
                {t("take")}
              </button>
              <button className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#E5E9F0] text-[#8A94A6]">
                {t("snooze")}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
