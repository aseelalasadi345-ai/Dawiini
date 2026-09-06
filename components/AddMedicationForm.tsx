"use client";

import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  medicationFormSchema,
  MedicationFormValues,
  FREQUENCIES,
  FREQUENCY_LABELS,
  REQUIRED_TIME_COUNT,
  defaultTimesFor,
} from "@/lib/schemas/medication";

interface MedicationFormProps {
  mode?: "add" | "edit";
  initialData?: MedicationFormValues;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (values: MedicationFormValues) => void;
}

// Presentational only — no axios/mutation calls in here. Owns local field
// state (via react-hook-form) and client-side validation, and calls
// onSubmit(values) on submit; it has no idea what happens to that data
// afterward. Shared by two callers: add/page.tsx (the real, backend-wired
// "Add Medication" flow this task covers) and EditMedicationModal.tsx
// (still a local-only mock edit flow, out of scope here) — both now supply
// isSubmitting/error/onSubmit themselves rather than this form owning any
// of that.
export default function AddMedicationForm({
  mode = "add",
  initialData,
  isSubmitting,
  error,
  onSubmit,
}: MedicationFormProps) {
  const t = useTranslations("addMedication");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MedicationFormValues>({
    // Pre-existing `as any`, left as-is (not the lint issue this task named,
    // and not a quick fix): medicationFormSchema's `times: z.array(...).default([])`
    // makes zodResolver's inferred input/output types diverge in a way TS can't
    // reconcile with useForm<MedicationFormValues>'s Resolver type. Confirmed by
    // actually removing this cast — it produces two real type errors.
    resolver: zodResolver(medicationFormSchema) as any,
    defaultValues: initialData ?? {
      medicationName: "",
      dosage: "",
      frequency: "once_daily",
      times: defaultTimesFor("once_daily"),
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      notes: "",
    },
  });

  // if initialData arrives after mount (async fetch in the modal), populate form
  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  // useWatch instead of methods.watch() — the latter tripped the
  // react-hooks/incompatible-library lint warning (React Compiler can't
  // safely memoize a component using useForm().watch()); useWatch is
  // react-hook-form's own hook-based subscription and doesn't have that
  // problem.
  const frequency = useWatch({ control, name: "frequency" });
  const times = useWatch({ control, name: "times" }) ?? [];
  const requiredCount = REQUIRED_TIME_COUNT[frequency];

  function addTime() {
    setValue("times", [...times, ""]);
  }

  function removeTime(index: number) {
    setValue(
      "times",
      times.filter((_, i) => i !== index),
    );
  }

  function updateTime(index: number, value: string) {
    const next = [...times];
    next[index] = value;
    setValue("times", next);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {error && (
        <div className="rounded-md bg-danger-light border border-danger-light-border text-danger-strong text-sm px-4 py-3">
          {error}
        </div>
      )}

      {/* Medication name */}
      <div>
        <label
          className="block text-sm font-medium mb-1"
          htmlFor="medicationName"
        >
          {t("medicationName")}
        </label>
        <input
          id="medicationName"
          type="text"
          placeholder="e.g. Paracetamol"
          {...register("medicationName")}
          aria-invalid={!!errors.medicationName}
          className="w-full rounded-md border border-border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        {errors.medicationName && (
          <p className="text-xs text-danger-strong mt-1">
            {errors.medicationName.message}
          </p>
        )}
      </div>

      {/* Dosage */}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="dosage">
          {t("dosage")}
        </label>
        <input
          id="dosage"
          type="text"
          placeholder="e.g. 500mg"
          {...register("dosage")}
          aria-invalid={!!errors.dosage}
          className="w-full rounded-md border border-border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        {errors.dosage && (
          <p className="text-xs text-danger-strong mt-1">{errors.dosage.message}</p>
        )}
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {t("frequency")}
        </label>
        <Controller
          control={control}
          name="frequency"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => {
                    field.onChange(freq);
                    setValue("times", defaultTimesFor(freq));
                  }}
                  className={`px-4 py-2 rounded-md border text-sm transition-colors active:scale-[0.97] ${
                    field.value === freq
                      ? "border-primary text-primary"
                      : "border-border text-muted hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {FREQUENCY_LABELS[freq]}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Times */}
      {requiredCount > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">{t("times")}</label>
          <div className="flex flex-wrap gap-2 items-center">
            {times.map((time, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateTime(i, e.target.value)}
                  className="rounded-md border border-border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
                {times.length > requiredCount && (
                  <button
                    type="button"
                    onClick={() => removeTime(i)}
                    className="text-xs text-danger rounded-md p-1 transition-colors hover:bg-danger-light active:bg-danger-light-border"
                    aria-label="Remove time"
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
          {errors.times && (
            <p className="text-xs text-danger-strong mt-1">
              {errors.times.message as string}
            </p>
          )}
        </div>
      )}

      {/* Dates */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1" htmlFor="startDate">
            {t("startDate")}
          </label>
          <input
            id="startDate"
            type="date"
            {...register("startDate")}
            className="w-full rounded-md border border-border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          {errors.startDate && (
            <p className="text-xs text-danger-strong mt-1">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1" htmlFor="endDate">
            {t("endDate")}
          </label>
          <input
            id="endDate"
            type="date"
            {...register("endDate")}
            className="w-full rounded-md border border-border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
          {errors.endDate && (
            <p className="text-xs text-danger-strong mt-1">
              {errors.endDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="notes">
          {t("notes")}
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="e.g. Take with food, avoid alcohol..."
          {...register("notes")}
          className="w-full rounded-md border border-border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
        {errors.notes && (
          <p className="text-xs text-danger-strong mt-1">{errors.notes.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-md text-white font-medium bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
      >
        {isSubmitting
          ? t("saving")
          : mode === "edit"
            ? t("saveChanges")
            : t("saveMedication")}
      </button>
    </form>
  );
}
