import { Check, Pill } from 'lucide-react';

export interface Dose {
  id: string;
  name: string;
  time: string;
  taken: boolean;
}

export default function DoseItem({
  dose,
  takeLabel,
  snoozeLabel,
}: {
  dose: Dose;
  takeLabel: string;
  snoozeLabel: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-brand-border bg-white px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span
          className={
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ' +
            (dose.taken ? 'bg-emerald-50' : 'bg-rose-50')
          }
        >
          {dose.taken ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Pill className="h-4 w-4 text-rose-500" />
          )}
        </span>
        <div>
          <p
            className={
              'text-sm font-semibold ' +
              (dose.taken ? 'text-slate-400 line-through' : 'text-brand-navy')
            }
          >
            {dose.name}
          </p>
          <p className="force-ltr text-xs text-slate-400">{dose.time}</p>
        </div>
      </div>

      {!dose.taken && (
        <div className="flex items-center gap-2">
          <button className="rounded-lg bg-brand-blue px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90">
            {takeLabel}
          </button>
          <button className="rounded-lg border border-brand-border px-3.5 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-mist">
            {snoozeLabel}
          </button>
        </div>
      )}
    </div>
  );
}
