"use client";

import { use, useState } from "react";
import { ChevronLeft, Heart, MapPin } from "lucide-react";
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
    <div className="p-6 flex flex-col gap-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground w-fit"
      >
        <ChevronLeft size={16} />
        {cameFromSaved ? t("back") : t("backToResults")}
      </button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{entry.name}</h1>
          <p className="text-sm text-muted">{entry.genericName}</p>
        </div>
        <button
          onClick={handleToggleSaved}
          aria-label={saved ? t("unsave") : t("save")}
          className="p-1.5 rounded-md hover:bg-surface"
        >
          <Heart
            size={24}
            className={saved ? "fill-red-500 text-red-500" : "text-muted"}
          />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {entry.categories.map((category) => (
          <span
            key={category}
            className="px-3 py-1 rounded-full text-xs bg-primary-light text-primary"
          >
            {category}
          </span>
        ))}
      </div>

      <p className="text-sm text-foreground">{entry.description}</p>

      <div>
        <p className="text-sm font-medium mb-2">{t("strength")}</p>
        <div className="flex flex-wrap gap-2">
          {entry.strengths.map((strength) => (
            <button
              key={strength}
              type="button"
              onClick={() => setSelectedStrength(strength)}
              className={`px-4 py-2 rounded-md border text-sm ${
                selectedStrength === strength
                  ? "border-blue-600 text-blue-600"
                  : "border-border text-muted"
              }`}
            >
              {strength}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">{t("form")}</p>
        <div className="flex flex-wrap gap-2">
          {entry.forms.map((form) => (
            <button
              key={form}
              type="button"
              onClick={() => setSelectedForm(form)}
              className={`px-4 py-2 rounded-md border text-sm ${
                selectedForm === form
                  ? "border-blue-600 text-blue-600"
                  : "border-border text-muted"
              }`}
            >
              {form}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted italic">{entry.disclaimer}</p>

      <div className="flex gap-3">
        <Link
          href={`/pharmacies?medicationId=${entry.id}`}
          className="flex-1 text-center py-3 rounded-md border border-border text-sm font-medium hover:bg-surface transition-colors"
        >
          {t("findPharmacies")}
        </Link>
        <button
          type="button"
          onClick={() => setShowSchedule(true)}
          className="flex-1 py-3 rounded-md text-white text-sm font-medium bg-gradient-to-r from-blue-600 to-teal-400"
        >
          {t("addToSchedule")}
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">{t("nearbyPharmacies")}</h2>
        <div className="flex flex-col gap-2">
          {entry.pharmacies.map((pharmacy) => (
            <Link
              key={pharmacy.pharmacyId}
              href={`/pharmacies/${pharmacy.pharmacyId}`}
              className="flex items-center justify-between p-4 rounded-md border border-border bg-white hover:bg-surface transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted shrink-0" />
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
                className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${
                  pharmacy.status === "in_stock"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
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

      <button
        type="button"
        onClick={handleToggleSaved}
        className={`w-full py-3 rounded-md border text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
          saved
            ? "border-red-500 text-red-500"
            : "border-border text-foreground hover:bg-surface"
        }`}
      >
        <Heart size={16} className={saved ? "fill-red-500 text-red-500" : ""} />
        {t("saved")}
      </button>

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
