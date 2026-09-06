"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  FileText,
  Loader2,
  Pill,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ScannedMedication, ScanResult, SCAN_HANDOFF_KEY } from "@/lib/scan";

type Step = "upload" | "uploaded" | "analyzing" | "results";

export default function ScanPrescriptionPage() {
  const t = useTranslations("scan");
  const router = useRouter();

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [medications, setMedications] = useState<ScannedMedication[]>([]);
  // A real system failure (network/timeout/server error) — distinct from
  // outcome === "failure", which means the AI scan ran fine but found no
  // legible medication info. Kept separate so the UI can say the right
  // thing (and skip the "AI-assisted" disclaimer when no AI scan actually
  // completed).
  const [scanError, setScanError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const webcamInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelected(selected: File | undefined) {
    if (!selected) return;
    setFile(selected);
    setFileName(selected.name);
    setStep("uploaded");
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelected(e.dataTransfer.files?.[0]);
  }

  async function startAnalysis() {
    if (!file) return;
    setStep("analyzing");
    setScanError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/search/scan", {
        method: "POST",
        body: formData,
      });
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setScanError(body?.error || "Something went wrong. Please try again.");
        setScanResult({ outcome: "failure", medications: [] });
        setMedications([]);
        setStep("results");
        return;
      }

      const result: ScanResult = body.data;
      setScanResult(result);
      setMedications(result.medications);
      setStep("results");
    } catch {
      setScanError("Couldn't reach the server. Check your connection and try again.");
      setScanResult({ outcome: "failure", medications: [] });
      setMedications([]);
      setStep("results");
    }
  }

  function resetToUpload() {
    setStep("upload");
    setFile(null);
    setFileName(null);
    setScanResult(null);
    setMedications([]);
    setScanError(null);
  }

  function removeMedication(id: string) {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }

  function updateMedication(
    id: string,
    field: "strength" | "frequency",
    value: string,
  ) {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  }

  function handleAddAllToSchedule() {
    try {
      sessionStorage.setItem(SCAN_HANDOFF_KEY, JSON.stringify(medications));
    } catch {
      // sessionStorage unavailable — the Add form just falls back to blank
    }
    router.push("/add");
  }

  function handleEnterManually() {
    router.push("/add");
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-5">
      <button
        onClick={step === "results" ? resetToUpload : () => router.back()}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground w-fit"
      >
        <ChevronLeft size={16} />
        {step === "results" ? t("rescan") : t("back")}
      </button>

      {step !== "results" && (
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted mt-1">{t("subtitle")}</p>
        </div>
      )}

      {(step === "upload" || step === "uploaded") && (
        <>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={`rounded-2xl border-2 border-dashed p-10 flex flex-col items-center text-center gap-2 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              step === "uploaded"
                ? "border-success-light-border bg-success-light"
                : isDragging
                  ? "border-primary bg-primary-light"
                  : "border-border bg-surface hover:border-muted"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 ${
                step === "uploaded" ? "bg-success-light-strong" : "bg-primary-light"
              }`}
            >
              {step === "uploaded" ? (
                <Check size={22} className="text-success" />
              ) : (
                <FileText size={22} className="text-primary" />
              )}
            </div>

            {step === "uploaded" ? (
              <>
                <p className="font-semibold text-sm text-success">
                  {t("uploadedTitle")}
                </p>
                <p className="text-xs text-muted">{fileName}</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-sm text-foreground">
                  {t("dropTitle")}
                </p>
                <p className="text-xs text-muted">{t("dropSubtitle")}</p>
                <p className="text-xs text-muted">{t("supports")}</p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />

          <div className="flex items-center gap-3 text-xs text-muted">
            <div className="flex-1 h-px bg-border" />
            {t("or")}
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={() => webcamInputRef.current?.click()}
            className="w-full py-3 rounded-2xl border border-border bg-surface text-sm font-medium text-foreground transition-colors hover:bg-background active:bg-border"
          >
            📷 {t("useWebcam")}
          </button>
          <input
            ref={webcamInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
          />

          {step === "uploaded" && (
            <button
              type="button"
              onClick={startAnalysis}
              className="w-full py-3 rounded-2xl text-white text-sm font-semibold bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98]"
            >
              {t("analyseButton")} →
            </button>
          )}
        </>
      )}

      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
          <Loader2 size={28} className="animate-spin text-primary" />
          <p className="text-sm">{t("analyzing")}</p>
        </div>
      )}

      {step === "results" && scanResult && (
        <>
          {scanResult.outcome === "success" && (
            <div className="flex items-start gap-3 rounded-2xl bg-success-light border border-success-light-strong p-4">
              <div className="w-8 h-8 rounded-full bg-success-light-strong flex items-center justify-center shrink-0">
                <Check size={16} className="text-success" />
              </div>
              <div>
                <p className="font-semibold text-sm text-success">
                  {t("successTitle")}
                </p>
                <p className="text-xs text-success mt-0.5">
                  {t("resultsDetected", { count: scanResult.medications.length })}
                </p>
              </div>
            </div>
          )}

          {scanResult.outcome === "partial" && (
            <div className="flex items-start gap-3 rounded-2xl bg-warning-light border border-warning-light-border p-4">
              <div className="w-8 h-8 rounded-full bg-warning-light-strong flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-warning-strong" />
              </div>
              <div>
                <p className="font-semibold text-sm text-warning-strongest">
                  {t("partialTitle")}
                </p>
                <p className="text-xs text-warning-strong mt-0.5">
                  {t("partialSubtitle")}
                </p>
              </div>
            </div>
          )}

          {scanResult.outcome === "failure" && (
            <div className="flex items-start gap-3 rounded-2xl bg-danger-light border border-danger-light-border p-4">
              <div className="w-8 h-8 rounded-full bg-danger-light-border flex items-center justify-center shrink-0">
                <X size={16} className="text-danger-strong" />
              </div>
              <div>
                <p className="font-semibold text-sm text-danger-strong">
                  {t("failureTitle")}
                </p>
                <p className="text-xs text-danger-strong mt-0.5">
                  {/* A real system error (network/timeout/server) gets its own
                      plain message from the server; a genuine "AI ran but
                      found nothing legible" outcome gets the translated copy. */}
                  {scanError || t("failureSubtitle")}
                </p>
              </div>
            </div>
          )}

          {!scanError && (
            <div className="flex items-start gap-2 rounded-xl bg-background border border-border text-xs text-muted px-4 py-3">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <p>{t("aiDisclaimer")}</p>
            </div>
          )}

          {scanResult.outcome === "failure" ? (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={resetToUpload}
                className="w-full py-3 rounded-2xl text-white text-sm font-semibold bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98]"
              >
                {t("tryAgain")}
              </button>
              <button
                type="button"
                onClick={handleEnterManually}
                className="w-full py-3 rounded-2xl border border-border text-sm font-medium text-foreground transition-colors hover:bg-background active:bg-border"
              >
                {t("enterManually")}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className="rounded-2xl bg-surface border border-border shadow-sm p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-danger-light flex items-center justify-center shrink-0">
                          <Pill size={16} className="text-danger" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {med.name || t("nameNotDetected")}
                          </p>
                          <p className="text-xs text-muted">
                            {med.strength
                              ? `${med.strength} · ${med.quantity}`
                              : med.quantity}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedication(med.id)}
                        aria-label={t("removeMedication")}
                        className="p-1 rounded-md text-muted transition-colors hover:bg-background active:bg-border"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          {t("strength")}
                        </label>
                        <input
                          type="text"
                          value={med.strength}
                          onChange={(e) =>
                            updateMedication(med.id, "strength", e.target.value)
                          }
                          placeholder={t("strengthPlaceholder")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-muted mb-1">
                          {t("frequency")}
                        </label>
                        <input
                          type="text"
                          value={med.frequency}
                          onChange={(e) =>
                            updateMedication(med.id, "frequency", e.target.value)
                          }
                          placeholder={t("frequencyPlaceholder")}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                      </div>
                    </div>
                    {(!med.name || !med.strength || !med.frequency) && (
                      <p className="text-xs text-warning-strong">
                        {t("notDetected")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {medications.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">
                  {t("noMedicationsLeft")}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleAddAllToSchedule}
                  className="w-full py-3 rounded-2xl text-white text-sm font-semibold bg-gradient-to-r from-gradient-start to-gradient-end transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  {t("addAllToSchedule")}
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
