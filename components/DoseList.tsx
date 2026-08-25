"use client";

import { useTranslations } from "next-intl";
import { Dose, DoseStatus } from "../lib/types";

interface DoseListProps {
  doses: Dose[];
  onStatusChange: (id: string, status: DoseStatus) => void;
  variant?: "compact" | "full"; // compact = Home widget, full = Today page
}

export default function DoseList({
  doses = [],
  onStatusChange,
  variant = "full",
}: DoseListProps) {
  const t = useTranslations("today");
  
  return (
    <div className="flex flex-col gap-3">
      {doses.map((dose) => (
        <div
          key={dose.id}
          className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-surface border border-border"
        >
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                dose.status === "taken"
                  ? "bg-success-light-strong"
                  : "bg-primary-light"
              }`}
            >
              {dose.status === "taken" ? "✓" : "💊"}
            </div>
            <div>
              <p
                className={`font-medium ${
                  dose.status === "taken" ? "line-through text-muted" : ""
                }`}
              >
                {dose.medicationName} {dose.dose}
              </p>
              <p className="text-sm text-muted">{dose.time}</p>
            </div>
          </div>

          {dose.status === "pending" ? (
            <div className="flex gap-2">
              <button
                onClick={() => onStatusChange(dose.id, "taken")}
                className="px-4 py-1.5 rounded-md bg-primary text-white text-sm transition-all hover:opacity-90 active:scale-[0.97]"
              >
                {t("take")}
              </button>
              {variant === "full" && (
                <button
                  onClick={() => onStatusChange(dose.id, "skipped")}
                  className="px-4 py-1.5 rounded-md border border-border text-sm transition-colors hover:bg-background active:bg-border"
                >
                  {t("skip")}
                </button>
              )}
              <button
                onClick={() => onStatusChange(dose.id, "pending")}
                className="px-4 py-1.5 rounded-md border border-border text-sm transition-colors hover:bg-background active:bg-border"
              >
                {t("snooze")}
              </button>
            </div>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                dose.status === "taken"
                  ? "bg-success-light-strong text-success"
                  : "bg-danger-light text-danger"
              }`}
            >
              {dose.status === "taken" ? t("taken") : t("skipped")}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}