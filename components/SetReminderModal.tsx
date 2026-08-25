"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface SetReminderModalProps {
  medicationName: string;
  initialTimes: string[];
  onClose: () => void;
  onSave: (times: string[]) => void;
}

export default function SetReminderModal({
  medicationName,
  initialTimes,
  onClose,
  onSave,
}: SetReminderModalProps) {
  const t = useTranslations("setReminder");
  const [times, setTimes] = useState<string[]>(
    initialTimes.length > 0 ? initialTimes : ["08:00"],
  );

  function addTime() {
    setTimes((prev) => [...prev, "08:00"]);
  }

  function removeTime(index: number) {
    setTimes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateTime(index: number, value: string) {
    setTimes((prev) => prev.map((time, i) => (i === index ? value : time)));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {t("title")}
          </h2>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="p-1 rounded-md text-muted transition-colors hover:bg-primary-light active:bg-border"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-muted mb-4">{medicationName}</p>

        <div className="flex flex-wrap gap-2 items-center mb-5">
          {times.map((time, i) => (
            <div key={i} className="flex items-center gap-1">
              <input
                type="time"
                value={time}
                onChange={(e) => updateTime(i, e.target.value)}
                className="rounded-md border border-border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              {times.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTime(i)}
                  className="text-xs text-danger rounded-md p-1 transition-colors hover:bg-danger-light active:bg-danger-light-border"
                  aria-label={t("removeTime")}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addTime}
            className="px-3 py-2 rounded-md border border-dashed border-border text-sm text-muted transition-colors hover:border-primary hover:text-primary active:scale-[0.97]"
          >
            + {t("addTime")}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSave(times)}
          className="w-full py-3 rounded-md text-white font-medium bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {t("save")}
        </button>
      </div>
    </div>
  );
}
