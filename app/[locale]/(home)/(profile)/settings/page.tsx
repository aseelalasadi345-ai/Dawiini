"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLogout } from "@/hooks/useAuth";
import { useProfile, useUpdateSettings } from "@/hooks/useProfile";
import type { IUserSettings } from "@/interfaces/interfaces";

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

// Matches UserSettings' own @default values in prisma/schema.prisma — shown
// until the user has ever saved a settings row of their own.
const DEFAULT_SETTINGS: IUserSettings = {
  doseReminders: true,
  stockAlerts: true,
  pharmacyUpdates: false,
  locale: "en",
};

export default function SettingsPage() {
  const t = useTranslations("profile.settings");
  const tCommon = useTranslations("profile");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const { data: response, isLoading, isError, refetch } = useProfile();
  const updateSettings = useUpdateSettings();
  const logoutMutation = useLogout();

  const [notifications, setNotifications] = useState(DEFAULT_SETTINGS);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Adjusting state during render (not in a useEffect) — see
  // personal-profile/page.tsx's comment for why.
  const settings = response?.data?.settings;
  const [loadedSettings, setLoadedSettings] = useState(settings);
  if (settings && settings !== loadedSettings) {
    setLoadedSettings(settings);
    setNotifications(settings);
  }

  // Toggles apply instantly (no Save button on this page, unlike
  // personal-profile/health-profile) — flip the switch immediately, fire
  // the mutation in the background, and revert + show the same inline
  // error banner used elsewhere if it fails.
  async function toggle(key: keyof Omit<IUserSettings, "locale">) {
    setSaveError(null);
    const next = !notifications[key];
    setNotifications((n) => ({ ...n, [key]: next }));
    try {
      await updateSettings.mutateAsync({ [key]: next });
    } catch {
      setNotifications((n) => ({ ...n, [key]: !next }));
      setSaveError(t("saveError"));
    }
  }

  function switchLocale() {
    const nextLocale = locale === "en" ? "ar" : "en";
    router.replace(pathname, { locale: nextLocale });
    // Best-effort persistence — the visible action (navigating to the new
    // locale) already happened, so a failure here isn't worth surfacing on
    // the page the user is about to leave.
    updateSettings.mutate({ locale: nextLocale });
  }

  async function handleLogout() {
    // Best-effort: even if the request fails (e.g. offline), still send the
    // user to /login — useLogout's onSuccess clears the client-side user
    // state and query cache, but a failed request means the server-side
    // session cookie wasn't cleared and will still be there next visit.
    try {
      await logoutMutation.mutateAsync();
    } finally {
      router.push("/login");
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 text-sm text-muted">
        {tCommon("loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col items-start gap-3">
        <p className="text-sm text-danger-strong">{tCommon("loadError")}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-4 py-2 rounded-full border border-border text-sm text-primary font-medium transition-colors hover:bg-primary-light"
        >
          {tCommon("retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {saveError && (
        <div className="rounded-md bg-danger-light border border-danger-light-border text-danger-strong text-sm px-4 py-3">
          {saveError}
        </div>
      )}

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
            onChange={() => toggle("doseReminders")}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{t("stockAlerts")}</span>
          <ToggleSwitch
            checked={notifications.stockAlerts}
            label={t("stockAlerts")}
            onChange={() => toggle("stockAlerts")}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{t("pharmacyUpdates")}</span>
          <ToggleSwitch
            checked={notifications.pharmacyUpdates}
            label={t("pharmacyUpdates")}
            onChange={() => toggle("pharmacyUpdates")}
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
