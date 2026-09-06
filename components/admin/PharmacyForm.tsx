'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { DAY_NAMES, type DayName } from '@/lib/pharmacyHours';

// Per-day override. `enabled: false` means "inherits the default schedule"
// (form.defaultIs24h/defaultOpensAt/defaultClosesAt) — the day's own
// closed/is24h/opensAt/closesAt fields are only meaningful once enabled.
// Kept as its own object (rather than only storing enabled days) so toggling
// a day off and back on doesn't lose whatever the admin had typed in.
interface DayException {
  day: DayName;
  enabled: boolean;
  closed: boolean;
  is24h: boolean;
  // "HH:MM", straight from a native <input type="time">.
  opensAt: string;
  closesAt: string;
}

function makeEmptyExceptions(): DayException[] {
  return DAY_NAMES.map((day) => ({ day, enabled: false, closed: false, is24h: false, opensAt: '', closesAt: '' }));
}

function makeEmptyForm() {
  return {
    name: '',
    address: '',
    phone: '',
    defaultIs24h: false,
    defaultOpensAt: '',
    defaultClosesAt: '',
    exceptions: makeEmptyExceptions(),
    mapUrl: '',
    latitude: '',
    longitude: '',
  };
}

type FormState = ReturnType<typeof makeEmptyForm>;

// One row per day (the same shape app/api/admin/pharmacies/route.ts and
// lib/validations/admin.ts already expect) — the API has no idea whether a
// day came from the default or an override, only that every day has its
// own final closed/is24h/opensAt/closesAt.
function resolveHours(form: FormState) {
  const resolved = DAY_NAMES.map((day) => {
    const exception = form.exceptions.find((e) => e.day === day)!;
    if (exception.enabled) {
      return {
        day,
        closed: exception.closed,
        is24h: !exception.closed && exception.is24h,
        opensAt: !exception.closed && !exception.is24h ? exception.opensAt : undefined,
        closesAt: !exception.closed && !exception.is24h ? exception.closesAt : undefined,
      };
    }
    return {
      day,
      closed: false,
      is24h: form.defaultIs24h,
      opensAt: form.defaultIs24h ? undefined : form.defaultOpensAt,
      closesAt: form.defaultIs24h ? undefined : form.defaultClosesAt,
    };
  });

  // If every resolved day ended up 24 hours — whether because the default
  // is 24h and nothing overrides it, or (less likely, but just as valid)
  // every day happens to be a 24h exception — take the existing "whole
  // pharmacy is 24 hours" shortcut instead of sending 7 identical rows.
  if (resolved.every((d) => d.is24h)) {
    return { is24Hours: true as const, hours: undefined };
  }
  return { is24Hours: false as const, hours: resolved };
}

export default function PharmacyForm() {
  const t = useTranslations('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState(makeEmptyForm);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateException = <K extends keyof Omit<DayException, 'day'>>(
    day: DayName,
    field: K,
    value: DayException[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      exceptions: prev.exceptions.map((e) => (e.day === day ? { ...e, [field]: value } : e)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const { is24Hours, hours } = resolveHours(form);

      const res = await fetch('/api/admin/pharmacies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          address: form.address,
          phone: form.phone,
          is24Hours,
          hours,
          mapUrl: form.mapUrl,
          // Empty string -> omitted entirely (not sent as 0/NaN) so the
          // server's z.number().optional() sees "not provided" rather than
          // a bogus coordinate.
          latitude: form.latitude === '' ? undefined : Number(form.latitude),
          longitude: form.longitude === '' ? undefined : Number(form.longitude),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setForm(makeEmptyForm());
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-bold text-brand-navy">{t('title')}</h1>
      <p className="mt-2 text-center text-sm text-brand-ink">{t('subtitle')}</p>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {t('successMessage')}
        </div>
      )}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            {t('nameLabel')}
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder={t('namePlaceholder')}
            className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            {t('addressLabel')}
          </label>
          <input
            id="address"
            type="text"
            required
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder={t('addressPlaceholder')}
            className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            {t('phoneLabel')}
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder={t('phonePlaceholder')}
            className="force-ltr w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        {/* Default schedule — applies to every day unless overridden below. */}
        <div>
          <p className="mb-1.5 text-sm font-semibold text-brand-navy">{t('defaultHoursLabel')}</p>
          <label className="flex items-center gap-2 text-sm text-brand-ink">
            <input
              type="checkbox"
              checked={form.defaultIs24h}
              onChange={(e) => updateField('defaultIs24h', e.target.checked)}
              className="h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
            />
            {t('open24Label')}
          </label>
          {!form.defaultIs24h && (
            <div className="force-ltr mt-2 flex items-center gap-2">
              <input
                type="time"
                required
                value={form.defaultOpensAt}
                onChange={(e) => updateField('defaultOpensAt', e.target.value)}
                aria-label={t('opensAtLabel')}
                className="rounded-lg border border-brand-border px-2 py-1.5 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
              <span className="text-xs text-brand-ink">–</span>
              <input
                type="time"
                required
                value={form.defaultClosesAt}
                onChange={(e) => updateField('defaultClosesAt', e.target.value)}
                aria-label={t('closesAtLabel')}
                className="rounded-lg border border-brand-border px-2 py-1.5 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          )}
        </div>

        {/* Per-day exceptions — a day left off just inherits the default
            above; enabling it lets that one day be closed, 24 hours, or a
            different time range, independent of the default and every
            other day (e.g. one 24-hour day in an otherwise-timed week). */}
        <div>
          <p className="mb-1 text-sm font-semibold text-brand-navy">{t('hoursLabel')}</p>
          <p className="mb-2 text-xs text-brand-ink">{t('hoursHint')}</p>
          <div className="flex flex-col gap-2">
            {form.exceptions.map((day) => (
              <div
                key={day.day}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-border p-3"
              >
                <span className="w-24 shrink-0 text-sm font-medium text-brand-navy">
                  {t(`days.${day.day}`)}
                </span>
                <label className="flex items-center gap-1.5 text-xs text-brand-ink">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => updateException(day.day, 'enabled', e.target.checked)}
                    className="h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
                  />
                  {t('exceptionLabel')}
                </label>

                {!day.enabled && (
                  <span className="text-xs text-brand-ink">{t('inheritsDefault')}</span>
                )}

                {day.enabled && (
                  <>
                    <label className="flex items-center gap-1.5 text-xs text-brand-ink">
                      <input
                        type="checkbox"
                        checked={day.closed}
                        onChange={(e) => updateException(day.day, 'closed', e.target.checked)}
                        className="h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
                      />
                      {t('closedLabel')}
                    </label>
                    {!day.closed && (
                      <label className="flex items-center gap-1.5 text-xs text-brand-ink">
                        <input
                          type="checkbox"
                          checked={day.is24h}
                          onChange={(e) => updateException(day.day, 'is24h', e.target.checked)}
                          className="h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
                        />
                        {t('open24Label')}
                      </label>
                    )}
                    {!day.closed && !day.is24h && (
                      <div className="force-ltr flex items-center gap-2">
                        <input
                          type="time"
                          required={day.enabled && !day.closed && !day.is24h}
                          value={day.opensAt}
                          onChange={(e) => updateException(day.day, 'opensAt', e.target.value)}
                          aria-label={t('opensAtLabel')}
                          className="rounded-lg border border-brand-border px-2 py-1.5 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        />
                        <span className="text-xs text-brand-ink">–</span>
                        <input
                          type="time"
                          required={day.enabled && !day.closed && !day.is24h}
                          value={day.closesAt}
                          onChange={(e) => updateException(day.day, 'closesAt', e.target.value)}
                          aria-label={t('closesAtLabel')}
                          className="rounded-lg border border-brand-border px-2 py-1.5 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="mapUrl" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            {t('mapUrlLabel')}
          </label>
          <input
            id="mapUrl"
            type="url"
            value={form.mapUrl}
            onChange={(e) => updateField('mapUrl', e.target.value)}
            placeholder={t('mapUrlPlaceholder')}
            className="force-ltr w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="latitude" className="mb-1.5 block text-sm font-semibold text-brand-navy">
              {t('latitudeLabel')}
            </label>
            <input
              id="latitude"
              type="number"
              step="any"
              min={-90}
              max={90}
              value={form.latitude}
              onChange={(e) => updateField('latitude', e.target.value)}
              placeholder={t('latitudePlaceholder')}
              className="force-ltr w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="longitude" className="mb-1.5 block text-sm font-semibold text-brand-navy">
              {t('longitudeLabel')}
            </label>
            <input
              id="longitude"
              type="number"
              step="any"
              min={-180}
              max={180}
              value={form.longitude}
              onChange={(e) => updateField('longitude', e.target.value)}
              placeholder={t('longitudePlaceholder')}
              className="force-ltr w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
          </div>
        </div>
        <p className="-mt-3 text-xs text-brand-ink">{t('coordinatesHint')}</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {t('submit')}
        </button>
      </form>
    </div>
  );
}
