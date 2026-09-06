"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProfile, useUpdatePersonalProfile } from "@/hooks/useProfile";
import { ApiError } from "@/lib/axios";
import { personalProfileFormSchema, type PersonalProfileFormValues } from "@/lib/validations/profile";
import FieldError from "@/components/auth/FieldError";

interface ReadOnlyFields {
  firstName: string;
  lastName: string;
  email: string;
}

const EMPTY_READ_ONLY: ReadOnlyFields = { firstName: "", lastName: "", email: "" };

export default function PersonalInfoPage() {
  const t = useTranslations("profile.personalInfo");
  const tCommon = useTranslations("profile");
  const tErrors = useTranslations("profile.errors");
  const { data: response, isLoading, isError, refetch } = useProfile();
  const updatePersonal = useUpdatePersonalProfile();

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // firstName/lastName/email are read-only display fields, not part of the
  // validated form below (see handleSave's comment on why they're never
  // sent to the API).
  const [readOnly, setReadOnly] = useState<ReadOnlyFields>(EMPTY_READ_ONLY);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalProfileFormValues>({
    resolver: zodResolver(personalProfileFormSchema),
    mode: "onBlur",
    defaultValues: { dateOfBirth: "", phone: "" },
  });

  // Seed the form from the fetched profile whenever it (re)loads —
  // status: 404 ("nothing filled in yet") still carries `data.personal`
  // (firstName/lastName/email always exist), so this branch covers both a
  // fully-empty profile and a partially-filled one the same way.
  //
  // Adjusting state during render (not in a useEffect) per React's own
  // guidance for "sync state to a prop/query result" —
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const personal = response?.data?.personal;
  const [loadedPersonal, setLoadedPersonal] = useState(personal);
  if (personal && personal !== loadedPersonal) {
    setLoadedPersonal(personal);
    setReadOnly({ firstName: personal.firstName, lastName: personal.lastName, email: personal.email });
    reset({ dateOfBirth: personal.dateOfBirth ?? "", phone: personal.phone ?? "" });
  }

  async function onSubmit(values: PersonalProfileFormValues) {
    setSaveError(null);
    try {
      // Only dateOfBirth/phone are actually sent — firstName/lastName/email
      // are read-only here (see app/api/profile/personal/route.ts: the
      // route doesn't accept them at all, they're core session/auth
      // identity fields), so those three fields are plain read-only display
      // rather than form inputs.
      await updatePersonal.mutateAsync(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      // Same inline-banner pattern as AddMedicationForm/SignupForm — there's
      // no toast system in this app. A rejected format (e.g. a hand-crafted
      // request bypassing the form validation below) still surfaces here,
      // since the API's own message comes straight from lib/schemas/profile.ts.
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

      <p className="text-xs text-muted -mb-1">{t("readOnlyNote")}</p>

      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">{t("firstName")}</label>
        <input
          type="text"
          value={readOnly.firstName}
          disabled
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-muted"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">{t("lastName")}</label>
        <input
          type="text"
          value={readOnly.lastName}
          disabled
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-muted"
        />
      </div>
      <div>
        <label htmlFor="dateOfBirth" className="block text-xs font-medium text-muted mb-1.5">
          {t("dateOfBirth")}
        </label>
        <input
          id="dateOfBirth"
          type="date"
          max={new Date().toISOString().slice(0, 10)}
          aria-invalid={!!errors.dateOfBirth}
          {...register("dateOfBirth")}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        <FieldError message={errors.dateOfBirth?.message && tErrors(errors.dateOfBirth.message)} />
      </div>
      <div>
        <label htmlFor="phone" className="block text-xs font-medium text-muted mb-1.5">
          {t("phone")}
        </label>
        <input
          id="phone"
          type="tel"
          aria-invalid={!!errors.phone}
          {...register("phone")}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        <FieldError message={errors.phone?.message && tErrors(errors.phone.message)} />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted mb-1.5">{t("email")}</label>
        <input
          type="email"
          value={readOnly.email}
          disabled
          className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-muted"
        />
      </div>
      <button
        type="submit"
        disabled={updatePersonal.isPending}
        className="w-full py-3 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
      >
        {saved ? t("saved") : t("save")}
      </button>
    </form>
  );
}
