"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile, useUpdateHealthProfile } from "@/hooks/useProfile";
import { ApiError } from "@/lib/axios";
import { BLOOD_TYPES, healthProfileFormSchema, type HealthProfileFormValues } from "@/lib/validations/profile";
import FieldError from "@/components/auth/FieldError";

const EMPTY: HealthProfileFormValues = {
  weightKg: "",
  heightCm: "",
  bloodType: "",
  allergies: "",
  chronicConditions: "",
};

export default function HealthInfoPage() {
  const t = useTranslations("profile.healthInfo");
  const tCommon = useTranslations("profile");
  const tErrors = useTranslations("profile.errors");
  const { data: response, isLoading, isError, refetch } = useProfile();
  const updateHealth = useUpdateHealthProfile();

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HealthProfileFormValues>({
    resolver: zodResolver(healthProfileFormSchema),
    mode: "onBlur",
    defaultValues: EMPTY,
  });

  // Adjusting state during render (not in a useEffect) — see
  // personal-profile/page.tsx's comment for why.
  const health = response?.data?.health;
  const [loadedHealth, setLoadedHealth] = useState(health);
  if (health && health !== loadedHealth) {
    setLoadedHealth(health);
    reset({
      weightKg: health.weightKg ?? "",
      heightCm: health.heightCm ?? "",
      bloodType: health.bloodType ?? "",
      allergies: health.allergies ?? "",
      chronicConditions: health.chronicConditions ?? "",
    });
  }

  async function onSubmit(values: HealthProfileFormValues) {
    setSaveError(null);
    try {
      await updateHealth.mutateAsync(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
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

  // First-time-user empty state: no HealthProfile row and no medications at
  // all yet (see app/api/profile/route.ts — `health` is only null when
  // both are absent). The form below is still shown right after it, so
  // this reads as "here's why it's blank," not a dead end.
  const isEmpty = !health;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl bg-surface border border-border shadow-sm p-6 flex flex-col gap-4"
    >
      {saveError && (
        <div className="rounded-md bg-danger-light border border-danger-light-border text-danger-strong text-sm px-4 py-3">
          {saveError}
        </div>
      )}

      <p className="text-xs text-muted -mb-1">{isEmpty ? t("empty") : t("note")}</p>

      <div>
        <label htmlFor="weightKg" className="block text-xs font-medium text-muted mb-1.5">
          {t("weight")}
        </label>
        <input
          id="weightKg"
          type="text"
          inputMode="decimal"
          aria-invalid={!!errors.weightKg}
          {...register("weightKg")}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        <FieldError message={errors.weightKg?.message && tErrors(errors.weightKg.message)} />
      </div>
      <div>
        <label htmlFor="heightCm" className="block text-xs font-medium text-muted mb-1.5">
          {t("height")}
        </label>
        <input
          id="heightCm"
          type="text"
          inputMode="decimal"
          aria-invalid={!!errors.heightCm}
          {...register("heightCm")}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        <FieldError message={errors.heightCm?.message && tErrors(errors.heightCm.message)} />
      </div>
      <div>
        <label htmlFor="bloodType" className="block text-xs font-medium text-muted mb-1.5">
          {t("bloodType")}
        </label>
        {/* A free-text input here previously accepted anything (e.g. "dhey")
            — a real blood type is one of a fixed, known set, so this is a
            dropdown rather than a regex-validated text field. */}
        <select
          id="bloodType"
          aria-invalid={!!errors.bloodType}
          {...register("bloodType")}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        >
          <option value="">{t("bloodTypePlaceholder")}</option>
          {BLOOD_TYPES.map((bt) => (
            <option key={bt} value={bt}>
              {bt}
            </option>
          ))}
        </select>
        <FieldError message={errors.bloodType?.message && tErrors(errors.bloodType.message)} />
      </div>
      <div>
        <label htmlFor="allergies" className="block text-xs font-medium text-muted mb-1.5">
          {t("allergies")}
        </label>
        <input
          id="allergies"
          type="text"
          {...register("allergies")}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="chronicConditions" className="block text-xs font-medium text-muted mb-1.5">
          {t("chronicConditions")}
        </label>
        <input
          id="chronicConditions"
          type="text"
          {...register("chronicConditions")}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>

      <button
        type="submit"
        disabled={updateHealth.isPending}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {saved ? t("saved") : t("save")}
      </button>

      {/* currentMedications comes free with GET /api/profile (derived from
          the Medication table, not a stored HealthProfile field) — surfaced
          here as a small read-only addition beyond what this page showed
          before, since it's genuinely relevant to a health profile. */}
      <div className="pt-2 border-t border-border">
        <p className="text-xs font-medium text-muted mb-2">{t("currentMedications")}</p>
        {health && health.currentMedications.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {health.currentMedications.map((m) => (
              <li key={m.id} className="text-sm text-foreground flex justify-between">
                <span>{m.name}</span>
                <span className="text-muted">{m.dose}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("noMedications")}</p>
        )}
      </div>
    </form>
  );
}
