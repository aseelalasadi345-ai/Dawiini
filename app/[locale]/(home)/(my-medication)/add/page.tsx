"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import AddMedicationForm from "@/components/AddMedicationForm";
import { useMedications } from "@/components/MedicationsProvider";
import { useRouter } from "@/i18n/navigation";
import { MedicationFormValues } from "@/lib/schemas/medication";
import { scannedMedicationToFormValues } from "@/lib/mappers/scan";
import { ScannedMedication, SCAN_HANDOFF_KEY } from "@/lib/mock/scanResults";

export default function AddMedicationPage() {
  const router = useRouter();
  const t = useTranslations("addMedication");
  const { addMedication } = useMedications();

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
        onSuccess={(medication) => addMedication(medication)}
      />
    </div>
  );
}
