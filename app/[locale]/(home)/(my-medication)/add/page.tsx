"use client";

import AddMedicationForm from "@/components/AddMedicationForm";
import { useMedications } from "@/components/MedicationsProvider";
import { useRouter } from "@/i18n/navigation";

export default function AddMedicationPage() {
  const router = useRouter();
  const { addMedication } = useMedications();

  return (
    <div className="max-w-xl mx-auto py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-muted mb-4"
      >
        ‹ Cancel
      </button>
      <h1 className="text-xl font-semibold mb-6">Add Medication</h1>
      <AddMedicationForm
        mode="add"
        onSuccess={(medication) => addMedication(medication)}
      />
    </div>
  );
}
