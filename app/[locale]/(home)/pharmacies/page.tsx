"use client";

import { use, useMemo, useState } from "react";
import { Navigation, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  findMedicationCatalogEntryByName,
  getMedicationCatalogEntry,
} from "@/lib/mock/medicationCatalog";
import { pharmacies, pharmacyHasStock } from "@/lib/mock/pharmacies";
import { getNextPendingDose, todayDoses } from "@/lib/mock/doses";
import { Pharmacy } from "@/lib/types";

interface PharmaciesPageProps {
  searchParams: Promise<{ medicationId?: string }>;
}

type FilterKey = "all" | "open" | "stock" | "near";

function directionsHref(pharmacy: Pharmacy): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${pharmacy.name} ${pharmacy.address}`,
  )}`;
}

export default function PharmaciesPage({ searchParams }: PharmaciesPageProps) {
  const { medicationId } = use(searchParams);
  const t = useTranslations("pharmacies");
  // Default to nearby pharmacies rather than the full unfiltered list —
  // the medication filter (below) narrows it further to what's relevant.
  const [filter, setFilter] = useState<FilterKey>("near");

  const explicitEntry = medicationId
    ? getMedicationCatalogEntry(medicationId)
    : undefined;

  // No medication was explicitly requested (e.g. arrived via the Home
  // page's "Find Pharmacies" card, not a specific drug's "Find in
  // Pharmacy" button) — default to whatever's next on today's schedule.
  const nextDose = !medicationId ? getNextPendingDose(todayDoses) : undefined;
  const defaultedEntry = nextDose
    ? findMedicationCatalogEntryByName(nextDose.medicationName)
    : undefined;

  const catalogEntry = explicitEntry ?? defaultedEntry;
  const isDefaultedFromSchedule = !explicitEntry && !!defaultedEntry;

  const stockByPharmacyId = useMemo(() => {
    if (!catalogEntry) return null;
    const map = new Map<string, boolean>();
    for (const stock of catalogEntry.pharmacies) {
      map.set(stock.pharmacyId, stock.status === "in_stock");
    }
    return map;
  }, [catalogEntry]);

  const visiblePharmacies = catalogEntry
    ? pharmacies.filter((pharmacy) => stockByPharmacyId?.has(pharmacy.id))
    : pharmacies;

  const filtered = visiblePharmacies.filter((pharmacy) => {
    const inStock = stockByPharmacyId?.get(pharmacy.id) ?? pharmacyHasStock(pharmacy);
    switch (filter) {
      case "open":
        return pharmacy.isOpen;
      case "stock":
        return inStock;
      case "near":
        return pharmacy.distanceKm < 1;
      default:
        return true;
    }
  });

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: t("filters.all") },
    { key: "open", label: t("filters.openNow") },
    { key: "stock", label: t("filters.inStock") },
    { key: "near", label: t("filters.nearby") },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-muted mt-1">
          {catalogEntry
            ? `${t(isDefaultedFromSchedule ? "filteredByNextDose" : "filteredBy")} ${
                catalogEntry.genericName || catalogEntry.name
              }${catalogEntry.strengths[0] ? ` ${catalogEntry.strengths[0]}` : ""}`
            : t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium text-center transition-colors active:scale-[0.97] ${
              filter === f.key
                ? "bg-primary text-white"
                : "bg-surface border border-border text-muted hover:border-hover-border hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Mock map */}
      <div className="relative rounded-2xl border border-border overflow-hidden h-56 bg-background">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border border-border/60 bg-border/10" />
          ))}
        </div>
        <div
          className="absolute w-3 h-3 rounded-full bg-avatar-gradient-start ring-4 ring-avatar-gradient-start/20 -translate-x-1/2 -translate-y-1/2"
          style={{ top: "50%", left: "50%" }}
        />
        {visiblePharmacies.map((pharmacy) => {
          const inStock =
            stockByPharmacyId?.get(pharmacy.id) ?? pharmacyHasStock(pharmacy);
          const color = !pharmacy.isOpen
            ? "bg-muted"
            : inStock
              ? "bg-success"
              : "bg-danger";
          return (
            <Link
              key={pharmacy.id}
              href={`/pharmacies/${pharmacy.id}`}
              className={`absolute w-5 h-5 rounded-full ${color} text-white flex items-center justify-center text-[10px] -translate-x-1/2 -translate-y-1/2 shadow-sm transition-transform hover:scale-110 active:scale-95`}
              style={{ top: pharmacy.mapPosition.top, left: pharmacy.mapPosition.left }}
              aria-label={pharmacy.name}
            >
              +
            </Link>
          );
        })}
        <div className="absolute bottom-2 left-2 bg-surface/95 border border-border rounded-lg px-3 py-2 text-xs text-muted flex flex-col gap-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" /> {t("legend.inStock")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-danger" /> {t("legend.outOfStock")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted" /> {t("legend.closed")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-avatar-gradient-start" /> {t("legend.here")}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((pharmacy) => {
            const inStock =
              stockByPharmacyId?.get(pharmacy.id) ?? pharmacyHasStock(pharmacy);
            return (
              <div
                key={pharmacy.id}
                className="rounded-2xl bg-surface border border-border shadow-sm p-4 flex flex-col gap-3"
              >
                <Link
                  href={`/pharmacies/${pharmacy.id}`}
                  className="flex items-start justify-between gap-3 rounded-lg -m-1 p-1 transition-colors hover:bg-background active:bg-border"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                        !pharmacy.isOpen
                          ? "bg-muted"
                          : inStock
                            ? "bg-success"
                            : "bg-danger"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {pharmacy.name}
                      </p>
                      <p className="text-xs text-muted mt-0.5">{pharmacy.address}</p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            pharmacy.isOpen
                              ? "bg-success-light text-success"
                              : "bg-background text-muted"
                          }`}
                        >
                          {pharmacy.isOpen ? t("open") : t("closed")}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            inStock
                              ? "bg-success-light text-success"
                              : "bg-danger-light text-danger-strong"
                          }`}
                        >
                          {inStock ? t("inStock") : t("outOfStock")}
                        </span>
                        <span className="text-xs text-muted">
                          {t("updatedAgo", { minutes: pharmacy.updatedMinutesAgo })}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1.5">
                        {pharmacy.is24Hours
                          ? t("open24")
                          : t("openUntil", { time: pharmacy.openUntil ?? "" })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted shrink-0">
                    {pharmacy.distanceKm} km
                  </span>
                </Link>

                <div className="flex gap-2">
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-background active:bg-border"
                  >
                    <Phone size={14} />
                    {t("call")}
                  </a>
                  <a
                    href={directionsHref(pharmacy)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-sm font-medium bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    <Navigation size={14} />
                    {t("directions")}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
