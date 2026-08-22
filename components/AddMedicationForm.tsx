"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  medicationFormSchema,
  MedicationFormValues,
  FREQUENCIES,
  FREQUENCY_LABELS,
  REQUIRED_TIME_COUNT,
} from "@/lib/schemas/medication";
import { Medication } from "@/lib/types";
import { formValuesToMedication } from "@/lib/mappers/medication";

interface MedicationFormProps {
  mode?: "add" | "edit";
  medicationId?: string;
  initialData?: MedicationFormValues;
  onSuccess?: (medication: Medication) => void; // called after save with the resulting medication
}

export default function AddMedicationForm({
  mode = "add",
  medicationId,
  initialData,
  onSuccess,
}: MedicationFormProps) {
  const t = useTranslations("addMedication");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema) as any,
    defaultValues: initialData ?? {
      medicationName: "",
      dosage: "",
      frequency: "once_daily",
      times: ["08:00"],
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
      notes: "",
    },
  });

  // if initialData arrives after mount (async fetch in the modal), populate form
  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  const frequency = watch("frequency");
  const times = watch("times") ?? [];
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

  async function onSubmit(values: MedicationFormValues) {
    setServerError(null);
    try {
      const id = mode === "edit" ? medicationId! : crypto.randomUUID();
      const medication = formValuesToMedication(values, id);

      onSuccess?.(medication);

      if (mode === "add") {
        router.push("/medications");
      }
    } catch (err) {
      setServerError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {serverError}
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
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {errors.medicationName && (
          <p className="text-xs text-red-600 mt-1">
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
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        {errors.dosage && (
          <p className="text-xs text-red-600 mt-1">{errors.dosage.message}</p>
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
                    const count = REQUIRED_TIME_COUNT[freq];
                    setValue("times", Array(count).fill("08:00"));
                  }}
                  className={`px-4 py-2 rounded-md border text-sm ${
                    field.value === freq
                      ? "border-blue-600 text-blue-600"
                      : "border-border text-muted"
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
                  className="rounded-md border border-border px-3 py-2 text-sm"
                />
                {times.length > requiredCount && (
                  <button
                    type="button"
                    onClick={() => removeTime(i)}
                    className="text-xs text-red-500"
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
              className="px-3 py-2 rounded-md border border-dashed border-border text-sm text-muted"
            >
              + {t("addTime")}
            </button>
          </div>
          {errors.times && (
            <p className="text-xs text-red-600 mt-1">
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
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          {errors.startDate && (
            <p className="text-xs text-red-600 mt-1">
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
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          {errors.endDate && (
            <p className="text-xs text-red-600 mt-1">
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
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        />
        {errors.notes && (
          <p className="text-xs text-red-600 mt-1">{errors.notes.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-md text-white font-medium bg-gradient-to-r from-blue-600 to-teal-400 disabled:opacity-60"
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