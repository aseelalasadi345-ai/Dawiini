"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSaveMedication, useUnsaveMedication } from "@/hooks/useSavedMedications";

interface SaveMedicationButtonProps {
  catalogEntryId: string;
  initialIsSaved: boolean;
}

// The detail page (a Server Component) already knows the real id and
// resolved isSaved status server-side — this just owns the click
// interaction, with an optimistic flip reverted on failure (e.g. a
// signed-out visitor gets a 401 from the mutation and the heart bounces
// back rather than lying about the outcome).
export default function SaveMedicationButton({
  catalogEntryId,
  initialIsSaved,
}: SaveMedicationButtonProps) {
  const t = useTranslations("mophDrugDetail");
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const saveMutation = useSaveMedication();
  const unsaveMutation = useUnsaveMedication();
  const isToggling = saveMutation.isPending || unsaveMutation.isPending;

  function handleToggle() {
    if (isSaved) {
      setIsSaved(false);
      unsaveMutation.mutate(catalogEntryId, { onError: () => setIsSaved(true) });
    } else {
      setIsSaved(true);
      saveMutation.mutate(catalogEntryId, { onError: () => setIsSaved(false) });
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isToggling}
      aria-label={isSaved ? t("unsave") : t("save")}
      className="shrink-0 p-2.5 rounded-xl border border-border transition-colors hover:bg-background active:bg-border disabled:opacity-60"
    >
      <Heart size={18} className={isSaved ? "fill-danger text-danger" : "text-muted"} />
    </button>
  );
}
