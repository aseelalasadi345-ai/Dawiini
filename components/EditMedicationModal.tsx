"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import AddMedicationForm from "./AddMedicationForm";
import { Medication } from "@/lib/types";
import { medicationToFormValues } from "@/lib/mappers/medication";
import type { MedicationFormValues } from "@/lib/schemas/medication";

interface EditMedicationModalProps {
  medication: Medication;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: MedicationFormValues) => void;
}

// Now backend-wired: medications/page.tsx owns the useUpdateMedication
// mutation (PATCH /api/medications/[id]) and passes isSubmitting/error/
// onSubmit straight through, same as add/page.tsx does for AddMedicationForm
// directly. This modal no longer synthesizes a Medication client-side
// (formValuesToMedication is gone) — the server's response is the source of
// truth, surfaced via the page's ["myMedications"] query refetch.
export default function EditMedicationModal({
  medication,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: EditMedicationModalProps) {
  const t = useTranslations("addMedication");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">
            {t("editTitle")}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-md text-muted transition-colors duration-150 hover:bg-background active:bg-border"
          >
            <X size={18} />
          </button>
        </div>

        <AddMedicationForm
          mode="edit"
          initialData={medicationToFormValues(medication)}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}