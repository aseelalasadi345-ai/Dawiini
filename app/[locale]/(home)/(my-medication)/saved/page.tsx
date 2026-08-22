"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useSavedMedications } from "@/components/SavedMedicationsProvider";

export default function SavedPage() {
  const t = useTranslations("saved");
  const { savedMedications, unsaveMedication } = useSavedMedications();

  if (savedMedications.length === 0) {
    return <p className="text-muted text-center py-10">{t("empty")}</p>;
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      {savedMedications.map((med) => (
        <div
          key={med.id}
          className="flex items-center justify-between p-5 rounded-[var(--radius-lg)] bg-white border border-border"
        >
          <div>
            <p className="font-semibold text-lg">
              {med.name} {med.dose}
            </p>
            <p className="text-sm text-muted mt-1">
              {med.brand} · {med.useCase}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/medications/${med.id}?from=saved`}
              className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground hover:bg-surface transition-colors"
            >
              {t("view")}
            </Link>
            <button
              onClick={() => unsaveMedication(med.id)}
              aria-label={t("unsave")}
              className="p-1.5 rounded-md hover:bg-surface"
            >
              <Heart size={20} className="fill-red-500 text-red-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
