// app/[locale]/(home)/TodayDosesWidget.tsx  (Home page)
"use client";

import { useTranslations } from "next-intl";
import DoseList from "@/components/DoseList";
import { useTodaySchedule, useUpdateDoseStatus } from "@/hooks/useSchedule";
import type { Dose, DoseStatus } from "@/lib/types";

// home/page.tsx is a multi-section Server Component (search, quick
// actions, recent searches, ...), not a single-purpose "doses" page — so
// this widget is the natural page-equivalent boundary for its own
// self-contained feature: it owns useTodaySchedule()/useUpdateDoseStatus()
// itself (same hooks, same invalidate-on-success wiring as
// today/page.tsx) rather than the parent page owning them and threading
// props down. DoseList underneath stays exactly as dumb either way.
export default function TodayDosesWidget() {
  const t = useTranslations("today");
  const { data: response, isLoading, isError, refetch } = useTodaySchedule();
  const updateDoseStatus = useUpdateDoseStatus();

  const doses: Dose[] = (response?.data ?? []).map((d) => ({
    id: d.doseId,
    medicationName: d.medicationName,
    dose: d.dose,
    time: d.time,
    status: d.status,
  }));

  function handleStatusChange(id: string, status: DoseStatus) {
    updateDoseStatus.mutate({ doseId: id, status });
  }

  if (isLoading) return <p className="text-sm text-muted">{t("loading")}</p>;

  if (isError) {
    return (
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
    );
  }

  if (doses.length === 0) {
    return <p className="text-sm text-muted">{t("empty")}</p>;
  }

  return <DoseList doses={doses} onStatusChange={handleStatusChange} variant="compact" />;
}
