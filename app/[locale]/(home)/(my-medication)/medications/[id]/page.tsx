"use client";

import { use, useState } from "react";
import { AlertTriangle, ChevronLeft, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getMedicationCatalogEntry } from "@/lib/mock/medicationCatalog";
import { useSavedMedications } from "@/components/SavedMedicationsProvider";
import SetReminderModal from "@/components/SetReminderModal";

interface MedicationDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default function MedicationDetailPage({
  params,
  searchParams,
}: MedicationDetailPageProps) {
  const { id } = use(params);
  const { from } = use(searchParams);
  const t = useTranslations("medicationDetail");
  const router = useRouter();
  const { isSaved, toggleSaved } = useSavedMedications();

  const entry = getMedicationCatalogEntry(id);

  const [selectedStrength, setSelectedStrength] = useState(
    entry?.strengths[0] ?? "",
  );
  const [selectedForm, setSelectedForm] = useState(entry?.forms[0] ?? "");
  const [showSchedule, setShowSchedule] = useState(false);

  if (!entry) {
    return <p className="p-6 text-muted text-center">{t("notFound")}</p>;
  }

  const saved = isSaved(entry.id);
  const cameFromSaved = from === "saved";

  function handleToggleSaved() {
    toggleSaved({
      id: entry!.id,
      name: entry!.name,
      dose: selectedStrength,
      brand: entry!.brand,
      useCase: entry!.useCase,
    });
  }

  function handleBack() {
    if (cameFromSaved) {
      router.push("/saved");
    } else {
      router.back();
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 p-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground w-fit"
      >
        <ChevronLeft size={16} />
        {cameFromSaved ? t("back") : t("backToResults")}
      </button>

      {/* Overview card */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {entry.name}
            </h1>
            <p className="text-sm text-muted mt-1">
              {t("genericName")}: {entry.genericName}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleSaved}
            aria-label={saved ? t("unsave") : t("save")}
            className="shrink-0 p-2.5 rounded-xl border border-border transition-colors hover:bg-background active:bg-border"
          >
            <Heart
              size={18}
              className={saved ? "fill-danger text-danger" : "text-muted"}
            />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {entry.categories.map((category) => (
            <span
              key={category}
              className="px-3 py-1 rounded-full text-xs font-medium bg-primary-light text-primary"
            >
              {category}
            </span>
          ))}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
            {t("strength")}
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.strengths.map((strength) => (
              <button
                key={strength}
                type="button"
                onClick={() => setSelectedStrength(strength)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors active:scale-[0.97] ${
                  selectedStrength === strength
                    ? "border-primary text-primary"
                    : "border-border text-muted hover:border-muted"
                }`}
              >
                {strength}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
            {t("form")}
          </p>
          <div className="flex flex-wrap gap-2">
            {entry.forms.map((form) => (
              <button
                key={form}
                type="button"
                onClick={() => setSelectedForm(form)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors active:scale-[0.97] ${
                  selectedForm === form
                    ? "border-primary text-primary"
                    : "border-border text-muted hover:border-muted"
                }`}
              >
                {form}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* About card */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">
          {t("about")}
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          {entry.description}
        </p>
        <div className="flex items-start gap-2 rounded-xl bg-warning-light border border-warning-light-border text-warning-strongest text-sm px-4 py-3">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <p>{entry.disclaimer}</p>
        </div>
      </div>

      {/* Nearby pharmacies card */}
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t("nearbyPharmacies")}
          </h2>
          <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-success" />
            {t("pharmaciesNearYou", { count: entry.pharmacies.length })}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {entry.pharmacies.map((pharmacy) => (
            <Link
              key={pharmacy.pharmacyId}
              href={`/pharmacies/${pharmacy.pharmacyId}`}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-background transition-colors hover:bg-primary-light/40 active:bg-primary-light"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    pharmacy.status === "in_stock"
                      ? "bg-success"
                      : "bg-danger"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {pharmacy.name}
                  </p>
                  <p className="text-xs text-muted">
                    {pharmacy.distance} ·{" "}
                    {pharmacy.isOpen ? t("open") : t("closed")}
                  </p>
                </div>
              </div>
              <span
                className={`text-sm font-medium shrink-0 ${
                  pharmacy.status === "in_stock"
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {pharmacy.status === "in_stock"
                  ? t("inStock")
                  : t("outOfStock")}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/pharmacies?medicationId=${entry.id}`}
          className="flex-1 text-center py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {t("findPharmacies")}
        </Link>
        <button
          type="button"
          onClick={() => setShowSchedule(true)}
          className="flex-1 py-3 rounded-xl border border-primary text-primary text-sm font-semibold transition-colors hover:bg-primary-light active:bg-primary-light/60"
        >
          {t("addToSchedule")}
        </button>
        <button
          type="button"
          onClick={handleToggleSaved}
          className={`flex-1 py-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98] ${
            saved
              ? "border-danger text-danger hover:bg-danger-light"
              : "border-border text-muted hover:bg-background active:bg-border"
          }`}
        >
          <Heart
            size={16}
            className={saved ? "fill-danger text-danger" : ""}
          />
          {saved ? t("saved") : t("save")}
        </button>
      </div>

      {showSchedule && (
        <SetReminderModal
          medicationName={`${entry.name} ${selectedStrength}`}
          initialTimes={["08:00"]}
          onClose={() => setShowSchedule(false)}
          onSave={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
}
