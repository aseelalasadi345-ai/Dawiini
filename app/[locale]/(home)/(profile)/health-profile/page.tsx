"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { mockHealthInfo } from "@/lib/mock/user";

export default function HealthInfoPage() {
  const t = useTranslations("profile.healthInfo");
  const [healthInfo, setHealthInfo] = useState(mockHealthInfo);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col gap-4">
      <p className="text-xs text-muted -mb-1">{t("note")}</p>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("weight")}
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={healthInfo.weightKg}
          onChange={(e) =>
            setHealthInfo((h) => ({ ...h, weightKg: e.target.value }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("height")}
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={healthInfo.heightCm}
          onChange={(e) =>
            setHealthInfo((h) => ({ ...h, heightCm: e.target.value }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("bloodType")}
        </label>
        <input
          type="text"
          value={healthInfo.bloodType}
          onChange={(e) =>
            setHealthInfo((h) => ({ ...h, bloodType: e.target.value }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("allergies")}
        </label>
        <input
          type="text"
          value={healthInfo.allergies}
          onChange={(e) =>
            setHealthInfo((h) => ({ ...h, allergies: e.target.value }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("chronicConditions")}
        </label>
        <input
          type="text"
          value={healthInfo.chronicConditions}
          onChange={(e) =>
            setHealthInfo((h) => ({
              ...h,
              chronicConditions: e.target.value,
            }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98]"
      >
        {saved ? t("saved") : t("save")}
      </button>
    </div>
  );
}
