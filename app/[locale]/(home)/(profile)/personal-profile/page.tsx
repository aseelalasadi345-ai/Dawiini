"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { mockPersonalInfo } from "@/lib/mock/user";

export default function PersonalInfoPage() {
  const t = useTranslations("profile.personalInfo");
  const [personalInfo, setPersonalInfo] = useState(mockPersonalInfo);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("firstName")}
        </label>
        <input
          type="text"
          value={personalInfo.firstName}
          onChange={(e) =>
            setPersonalInfo((p) => ({ ...p, firstName: e.target.value }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("lastName")}
        </label>
        <input
          type="text"
          value={personalInfo.lastName}
          onChange={(e) =>
            setPersonalInfo((p) => ({ ...p, lastName: e.target.value }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("dateOfBirth")}
        </label>
        <input
          type="text"
          value={personalInfo.dateOfBirth}
          onChange={(e) =>
            setPersonalInfo((p) => ({ ...p, dateOfBirth: e.target.value }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("phone")}
        </label>
        <input
          type="tel"
          value={personalInfo.phone}
          onChange={(e) =>
            setPersonalInfo((p) => ({ ...p, phone: e.target.value }))
          }
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">
          {t("email")}
        </label>
        <input
          type="email"
          value={personalInfo.email}
          onChange={(e) =>
            setPersonalInfo((p) => ({ ...p, email: e.target.value }))
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
