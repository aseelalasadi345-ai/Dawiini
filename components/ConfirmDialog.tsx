"use client";

interface ConfirmDialogProps {
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  body,
  confirmLabel,
  cancelLabel,
  isSubmitting = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted mb-4">{body}</p>
        {error && (
          <div className="rounded-md bg-danger-light border border-danger-light-border text-danger-strong text-sm px-4 py-3 mb-4">
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-md border border-border text-sm font-medium text-foreground transition-colors hover:bg-background active:bg-border disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-md text-white text-sm font-semibold bg-danger transition-all hover:bg-danger-strong active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
