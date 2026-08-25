"use client";

import { use } from "react";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import medicationsData from "@/data/medications.json";

interface MophMedicationDetailPageProps {
  params: Promise<{ index: string }>;
}

export default function MophMedicationDetailPage({
  params,
}: MophMedicationDetailPageProps) {
  const { index } = use(params);
  const router = useRouter();
  const t = useTranslations("mophDrugDetail");

  const medication = medicationsData.medications[Number(index)];

  if (!medication) {
    return <p className="p-6 text-muted text-center">{t("notFound")}</p>;
  }

  const details: { label: string; value?: string }[] = [
    { label: t("ingredients"), value: medication.ingredients },
    { label: t("atcCode"), value: medication.atcCode },
    { label: t("category"), value: medication.bg },
    { label: t("price"), value: medication.price },
  ].filter((d) => d.value);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4 p-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground w-fit"
      >
        <ChevronLeft size={16} />
        {t("back")}
      </button>

      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col gap-5">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {medication.name}
          </h1>
          {medication.nameAr && (
            <p className="text-sm text-muted mt-1" dir="rtl">
              {medication.nameAr}
            </p>
          )}
        </div>

        {(medication.form || medication.strength) && (
          <div className="flex flex-wrap gap-2">
            {medication.form && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                {medication.form}
              </span>
            )}
            {medication.strength && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-light text-primary">
                {medication.strength}
              </span>
            )}
          </div>
        )}

        {details.length > 0 && (
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {details.map((d) => (
              <div key={d.label} className="contents">
                <dt className="text-muted">{d.label}</dt>
                <dd className="text-foreground">{d.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {medication.sourceUrl && (
          <a
            href={medication.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary font-medium w-fit hover:underline"
          >
            {t("viewOnMoph")}
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
