"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import MedicationCardMenu from "@/components/MedicationCardMenu";
import EditMedicationModal from "@/components/EditMedicationModal";
import SetReminderModal from "@/components/SetReminderModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  useMyMedications,
  useUpdateMedication,
  useDeleteMedication,
} from "@/hooks/useMedications";
import { ApiError } from "@/lib/axios";
import { searchMedicationCatalog } from "@/lib/api/medications";
import { FREQUENCY_LABELS } from "@/lib/schemas/medication";
import {
  apiMedicationToMedication,
  formatMedicationSince,
  medicationToFormValues,
} from "@/lib/mappers/medication";

// Owns all backend interaction: useMyMedications() (GET /api/medications/mine)
// plus useUpdateMedication()/useDeleteMedication() (PATCH/DELETE
// /api/medications/[id] — see hooks/useMedications.ts, including their
// invalidate-on-success wiring). Edit, Set Reminder, and Delete all funnel
// through these two mutations; MedicationCardMenu/EditMedicationModal/
// SetReminderModal/ConfirmDialog stay presentational, only calling back up
// through props.
//
// "Find in Pharmacy" resolves a medication's name against the real MOPH
// catalog (searchMedicationCatalog -> GET /api/medications?q=) instead of
// the old lib/mock/medicationCatalog.ts lookup table — no mock data feeds
// this page anymore. Note this is a best-effort match (first "contains"
// hit, e.g. "Metformin" -> "METFORMINE ARROW LAB"), not an exact lookup —
// the catalog has no field tying a scraped listing back to a specific
// regimen entry. /pharmacies now reads real Pharmacy rows (see its own
// page), but it no longer has any medication-availability filtering to
// apply — that's out of scope pending a real inventory data source (see
// that page's comment) — so `?medicationId=` is simply ignored there today.
function errorMessage(error: unknown, fallback: string): string | null {
  if (error instanceof ApiError) return error.message;
  return error ? fallback : null;
}

export default function MedicationsPage() {
  const t = useTranslations("medications");
  const tMenu = useTranslations("medicationCardMenu");
  const router = useRouter();

  const { data: response, isLoading, isError, refetch } = useMyMedications();
  const updateMedication = useUpdateMedication();
  const deleteMedication = useDeleteMedication();

  const medications = (response?.data ?? []).map(apiMedicationToMedication);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const editingMedication = medications.find((m) => m.id === editingId) ?? null;
  const remindingMedication =
    medications.find((m) => m.id === remindingId) ?? null;
  const deletingMedication = medications.find((m) => m.id === deletingId) ?? null;

  async function handleFindInPharmacy(id: string) {
    const medication = medications.find((m) => m.id === id);
    if (!medication) {
      router.push("/pharmacies");
      return;
    }

    try {
      const [hit] = await searchMedicationCatalog(medication.name);
      router.push(hit ? `/pharmacies?medicationId=${hit.id}` : "/pharmacies");
    } catch {
      // Catalog search failed — fall back to the unfiltered pharmacies list
      // rather than blocking navigation on it.
      router.push("/pharmacies");
    }
  }

  return (
    <div className="p-6">
      {isLoading && <p className="text-sm text-muted">{t("loading")}</p>}

      {isError && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-danger-strong">{t("loadError")}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-full border border-border text-sm text-primary font-medium transition-colors hover:bg-primary-light"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="flex flex-col gap-4">
          {medications.length === 0 ? (
            <p className="text-muted text-center py-10">{t("empty")}</p>
          ) : (
            medications.map((med) => (
              <div
                key={med.id}
                className="flex items-start justify-between p-5 rounded-[var(--radius-lg)] bg-white border border-border"
              >
                <div>
                  <p className="font-semibold text-lg">
                    {med.name} {med.dose}
                  </p>
                  <p className="text-sm text-muted mt-1">
                    {FREQUENCY_LABELS[med.frequency]}
                  </p>
                  <p className="text-sm text-muted">
                    {t("since")} {formatMedicationSince(med.startDate)}
                  </p>
                </div>

                <MedicationCardMenu
                  medicationId={med.id}
                  onEdit={(id) => setEditingId(id)}
                  onFindInPharmacy={handleFindInPharmacy}
                  onSetReminder={(id) => setRemindingId(id)}
                  onDelete={(id) => setDeletingId(id)}
                />
              </div>
            ))
          )}
        </div>
      )}

      {editingMedication && (
        <EditMedicationModal
          medication={editingMedication}
          isSubmitting={updateMedication.isPending}
          error={errorMessage(updateMedication.error, t("actionError"))}
          onClose={() => {
            updateMedication.reset();
            setEditingId(null);
          }}
          onSubmit={(values) => {
            updateMedication.mutate(
              { id: editingMedication.id, values },
              { onSuccess: () => setEditingId(null) },
            );
          }}
        />
      )}

      {remindingMedication && (
        <SetReminderModal
          medicationName={`${remindingMedication.name} ${remindingMedication.dose}`}
          initialTimes={remindingMedication.times}
          isSubmitting={updateMedication.isPending}
          error={errorMessage(updateMedication.error, t("actionError"))}
          onClose={() => {
            updateMedication.reset();
            setRemindingId(null);
          }}
          onSave={(times) => {
            updateMedication.mutate(
              {
                id: remindingMedication.id,
                values: medicationToFormValues({ ...remindingMedication, times }),
              },
              { onSuccess: () => setRemindingId(null) },
            );
          }}
        />
      )}

      {deletingMedication && (
        <ConfirmDialog
          title={tMenu("deleteConfirmTitle")}
          body={tMenu("deleteConfirmBody", {
            name: `${deletingMedication.name} ${deletingMedication.dose}`,
          })}
          confirmLabel={tMenu("confirmDelete")}
          cancelLabel={tMenu("cancel")}
          isSubmitting={deleteMedication.isPending}
          error={errorMessage(deleteMedication.error, t("actionError"))}
          onCancel={() => {
            deleteMedication.reset();
            setDeletingId(null);
          }}
          onConfirm={() => {
            deleteMedication.mutate(deletingMedication.id, {
              onSuccess: () => setDeletingId(null),
            });
          }}
        />
      )}
    </div>
  );
}
