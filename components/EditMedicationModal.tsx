"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import AddMedicationForm from "./AddMedicationForm";
import { Medication } from "@/lib/types";
import { medicationToFormValues } from "@/lib/mappers/medication";

interface EditMedicationModalProps {
  medication: Medication;
  onClose: () => void;
  onSaved: (updated: Medication) => void;
}

export default function EditMedicationModal({
  medication,
  onClose,
  onSaved,
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
          medicationId={medication.id}
          initialData={medicationToFormValues(medication)}
          onSuccess={(updated) => onSaved(updated)}
        />
      </div>
    </div>
  );
}