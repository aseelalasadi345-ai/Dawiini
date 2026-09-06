"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AddMedicationForm from "@/components/AddMedicationForm";
import { useCreateMedication } from "@/hooks/useMedications";
import { useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/axios";
import { MedicationFormValues } from "@/lib/schemas/medication";
import { scannedMedicationToFormValues } from "@/lib/mappers/scan";
import { ScannedMedication, SCAN_HANDOFF_KEY } from "@/lib/scan";

// Owns all backend interaction: the useCreateMedication mutation (wrapping
// POST /api/medications — see hooks/useMedications.ts, including its
// invalidate-on-success wiring) and the redirect on success.
// AddMedicationForm below is purely presentational — it only knows how to
// call onSubmit(values).
function errorMessage(error: unknown): string | null {
  if (error instanceof ApiError) return error.message;
  return error ? "Something went wrong. Please try again." : null;
}

export default function AddMedicationPage() {
  const router = useRouter();
  const t = useTranslations("addMedication");
  const createMedication = useCreateMedication();

  const [scanPrefill, setScanPrefill] = useState<MedicationFormValues | null>(
    null,
  );
  const [remainingScanned, setRemainingScanned] = useState(0);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SCAN_HANDOFF_KEY);
      if (!raw) return;
      sessionStorage.removeItem(SCAN_HANDOFF_KEY);

      const scanned: ScannedMedication[] = JSON.parse(raw);
      if (scanned.length === 0) return;

      setScanPrefill(scannedMedicationToFormValues(scanned[0]));
      setRemainingScanned(scanned.length - 1);
    } catch {
      // malformed/unavailable sessionStorage — just fall back to a blank form
    }
  }, []);

  function handleSubmit(values: MedicationFormValues) {
    createMedication.mutate(values, {
      onSuccess: () => router.push("/medications"),
    });
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-muted mb-4 transition-colors hover:text-foreground"
      >
        ‹ Cancel
      </button>
      <h1 className="text-xl font-semibold mb-2">Add Medication</h1>

      {scanPrefill && (
        <p className="text-sm text-primary bg-primary-light rounded-lg px-4 py-3 mb-6">
          {remainingScanned > 0
            ? t("prefilledFromScanMultiple", { count: remainingScanned })
            : t("prefilledFromScan")}
        </p>
      )}

      <AddMedicationForm
        mode="add"
        initialData={scanPrefill ?? undefined}
        isSubmitting={createMedication.isPending}
        error={errorMessage(createMedication.error)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
