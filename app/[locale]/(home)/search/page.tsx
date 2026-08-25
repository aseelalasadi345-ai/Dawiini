"use client";

import { Camera } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { medicationCatalog } from "@/lib/mock/medicationCatalog";
import { MedicationSearchResult } from "@/lib/medicationSearch";
import MedicationAutocomplete from "@/components/MedicationAutocomplete";
import medicationsData from "@/data/medications.json";

export default function SearchPage() {
  const t = useTranslations("search");
  const router = useRouter();

  function handleSelect(result: MedicationSearchResult) {
    router.push(`/medications/moph/${result.index}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {t("title")}
        </h1>
        <MedicationAutocomplete
          medications={medicationsData.medications}
          onSelect={handleSelect}
        />
      </div>

      <Link
        href="/search/scan"
        className="flex items-center gap-4 bg-surface border border-border rounded-xl shadow-sm transition-all hover:shadow-md hover:border-hover-border active:scale-[0.99] p-4"
      >
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-primary-light shrink-0">
          <Camera size={20} className="text-primary" />
        </div>
        <div>
          <p className="font-semibold text-sm text-foreground">
            {t("scanPrescription")}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {t("scanPrescriptionSub")}
          </p>
        </div>
      </Link>

      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">
          {t("browseCatalog")}
        </h2>
        <div className="flex flex-col gap-2">
          {medicationCatalog.map((entry) => (
            <Link
              key={entry.id}
              href={`/medications/${entry.id}?from=search`}
              className="flex items-center justify-between p-4 rounded-xl bg-surface border border-border transition-all hover:border-hover-border hover:shadow-sm active:scale-[0.99]"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {entry.name}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  {entry.genericName} · {entry.useCase}
                </p>
              </div>
              <span className="text-xs text-muted shrink-0">
                {entry.strengths[0]}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
