"use client";

import { Camera, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import MedicationAutocomplete from "@/components/MedicationAutocomplete";
import { useAuth } from "@/components/AuthProvider";
import { useRecentSearches, useRecordRecentSearch } from "@/hooks/useRecentSearches";
import type { ICatalogSearchHit } from "@/interfaces/interfaces";

export default function SearchPage() {
  const t = useTranslations("search");
  const router = useRouter();
  const { user } = useAuth();

  // Only fetched/recorded when signed in — recent searches are per-user.
  const { data: recentResponse } = useRecentSearches(4, !!user);
  const recordRecentSearch = useRecordRecentSearch();
  const recentSearches = recentResponse?.data ?? [];

  function handleSelect(result: ICatalogSearchHit) {
    if (user) recordRecentSearch.mutate(result.id);
    router.push(`/medications/${result.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {t("title")}
        </h1>
        <MedicationAutocomplete onSelect={handleSelect} />
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

      {recentSearches.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            {t("recentSearches")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((r) => (
              <Link
                key={r.catalogEntryId}
                href={`/medications/${r.catalogEntryId}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border border-border text-sm text-foreground shadow-sm transition-all hover:border-hover-border hover:text-primary active:scale-[0.97]"
              >
                <RotateCcw size={12} className="text-muted" />
                {r.name} {r.strength}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
