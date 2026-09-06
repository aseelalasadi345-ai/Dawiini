"use client";

import { useTranslations } from "next-intl";
import DoseList from "@/components/DoseList";
import { useTodaySchedule, useUpdateDoseStatus } from "@/hooks/useSchedule";
import type { Dose, DoseStatus } from "@/lib/types";

// Owns all backend interaction for this page: useTodaySchedule() (the
// useQuery wrapping GET /api/schedule/today) and useUpdateDoseStatus() (the
// useMutation wrapping PATCH /api/schedule/doses/[id], including its
// invalidate-on-success wiring — see hooks/useSchedule.ts). Derives
// loading/error state from these and passes plain data + a callback down
// to DoseList, which is purely presentational — no axios/mutation calls of
// its own, it only renders doses and calls onStatusChange.
export default function TodayPage() {
  const t = useTranslations("today");
  const { data: response, isLoading, isError, refetch } = useTodaySchedule();
  const updateDoseStatus = useUpdateDoseStatus();

  // IDoseToday (the route's real shape: doseId, medicationId, notes,
  // takenAt, ...) mapped down to the Dose shape DoseList already expects
  // (lib/types.ts) — this mapping is exactly the kind of thing the page,
  // not the dumb display component, should own.
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("title")}</h1>

      {isLoading && <p className="text-sm text-muted">{t("loading")}</p>}

      {isError && (
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
      )}

      {!isLoading && !isError && doses.length === 0 && (
        <p className="text-sm text-muted">{t("empty")}</p>
      )}

      {!isLoading && !isError && doses.length > 0 && (
        <DoseList doses={doses} onStatusChange={handleStatusChange} variant="full" />
      )}
    </div>
  );
}
