"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import MedicationCardMenu from "@/components/MedicationCardMenu";
import EditMedicationModal from "@/components/EditMedicationModal";
import SetReminderModal from "@/components/SetReminderModal";
import { useMedications } from "@/components/MedicationsProvider";
import { FREQUENCY_LABELS } from "@/lib/schemas/medication";
import { formatMedicationSince } from "@/lib/mappers/medication";

export default function MedicationsPage() {
  const t = useTranslations("medications");
  const router = useRouter();
  const { medications, updateMedication, deleteMedication } = useMedications();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  const editingMedication = medications.find((m) => m.id === editingId) ?? null;
  const remindingMedication =
    medications.find((m) => m.id === remindingId) ?? null;

  return (
    <div className="p-6">
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
                onFindInPharmacy={(id) =>
                  router.push(`/pharmacies?medicationId=${id}`)
                }
                onSetReminder={(id) => setRemindingId(id)}
                onDelete={deleteMedication}
              />
            </div>
          ))
        )}
      </div>

      {editingMedication && (
        <EditMedicationModal
          medication={editingMedication}
          onClose={() => setEditingId(null)}
          onSaved={(updated) => {
            updateMedication(updated);
            setEditingId(null);
          }}
        />
      )}

      {remindingMedication && (
        <SetReminderModal
          medicationName={`${remindingMedication.name} ${remindingMedication.dose}`}
          initialTimes={remindingMedication.times}
          onClose={() => setRemindingId(null)}
          onSave={() => setRemindingId(null)}
        />
      )}
    </div>
  );
}