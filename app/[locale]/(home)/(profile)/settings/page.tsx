"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { mockNotificationSettings } from "@/lib/mock/user";

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 active:scale-95 ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
          checked ? "start-5.5" : "start-0.5"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const t = useTranslations("profile.settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState(mockNotificationSettings);

  function switchLocale() {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
  }

  function handleLogout() {
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {t("language")}
          </p>
          <p className="text-xs text-muted mt-0.5">
            {locale === "en" ? "English" : "العربية"}
          </p>
        </div>
        <button
          type="button"
          onClick={switchLocale}
          className="px-4 py-2 rounded-full border border-border text-sm text-primary font-medium transition-colors hover:bg-primary-light active:bg-primary-light/60 shrink-0"
        >
          {locale === "en" ? "Switch to العربية" : "Switch to English"}
        </button>
      </div>

      <div className="rounded-2xl bg-surface border border-border shadow-sm p-5 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground">
          {t("notifications")}
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{t("doseReminders")}</span>
          <ToggleSwitch
            checked={notifications.doseReminders}
            label={t("doseReminders")}
            onChange={() =>
              setNotifications((n) => ({
                ...n,
                doseReminders: !n.doseReminders,
              }))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{t("stockAlerts")}</span>
          <ToggleSwitch
            checked={notifications.stockAlerts}
            label={t("stockAlerts")}
            onChange={() =>
              setNotifications((n) => ({
                ...n,
                stockAlerts: !n.stockAlerts,
              }))
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{t("pharmacyUpdates")}</span>
          <ToggleSwitch
            checked={notifications.pharmacyUpdates}
            label={t("pharmacyUpdates")}
            onChange={() =>
              setNotifications((n) => ({
                ...n,
                pharmacyUpdates: !n.pharmacyUpdates,
              }))
            }
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full py-3 rounded-xl border border-danger text-danger text-sm font-semibold transition-colors hover:bg-danger-light active:bg-danger-light-border"
      >
        {t("logout")}
      </button>
    </div>
  );
}
