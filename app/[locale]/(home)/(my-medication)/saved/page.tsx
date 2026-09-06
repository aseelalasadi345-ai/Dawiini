"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  useSavedMedicationsList,
  useUnsaveMedication,
} from "@/hooks/useSavedMedications";

export default function SavedPage() {
  const t = useTranslations("saved");
  const { data: response, isLoading } = useSavedMedicationsList();
  const unsaveMutation = useUnsaveMedication();

  const items = response?.data ?? [];

  if (isLoading) {
    return <p className="text-muted text-center py-10">{t("loading")}</p>;
  }

  if (items.length === 0) {
    return <p className="text-muted text-center py-10">{t("empty")}</p>;
  }

  return (
    <div className="p-6 flex flex-col gap-4">
      {items.map((med) => (
        <div
          key={med.catalogEntryId}
          className="flex items-center justify-between p-5 rounded-[var(--radius-lg)] bg-white border border-border"
        >
          <div>
            <p className="font-semibold text-lg">
              {med.name} {med.strength}
            </p>
            <p className="text-sm text-muted mt-1">
              {[med.brand, med.useCase].filter(Boolean).join(" · ") || med.form}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/medications/${med.catalogEntryId}`}
              className="px-4 py-2 rounded-md border border-border text-sm font-medium text-foreground transition-colors hover:bg-background active:bg-border"
            >
              {t("view")}
            </Link>
            <button
              onClick={() => unsaveMutation.mutate(med.catalogEntryId)}
              disabled={unsaveMutation.isPending}
              aria-label={t("unsave")}
              className="p-1.5 rounded-md transition-colors hover:bg-background active:bg-border disabled:opacity-60"
            >
              <Heart size={20} className="fill-danger text-danger" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
