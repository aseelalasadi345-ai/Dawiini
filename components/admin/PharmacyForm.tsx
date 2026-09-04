'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function PharmacyForm() {
  const t = useTranslations('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    is24Hours: false,
    opensAt: '',
    openUntil: '',
    mapUrl: '',
  });

  const updateField = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/admin/pharmacies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
      setForm({
        name: '',
        address: '',
        phone: '',
        is24Hours: false,
        opensAt: '',
        openUntil: '',
        mapUrl: '',
      });
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

        <label className="flex items-center gap-2 text-sm text-brand-ink">
          <input
            type="checkbox"
            checked={form.is24Hours}
            onChange={(e) => updateField('is24Hours', e.target.checked)}
            className="h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
          />
          {t('open24Label')}
        </label>

        {!form.is24Hours && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="opensAt" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                {t('opensAtLabel')}
              </label>
              <input
                id="opensAt"
                type="text"
                required={!form.is24Hours}
                value={form.opensAt}
                onChange={(e) => updateField('opensAt', e.target.value)}
                placeholder={t('opensAtPlaceholder')}
                className="force-ltr w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label htmlFor="openUntil" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                {t('closesAtLabel')}
              </label>
              <input
                id="openUntil"
                type="text"
                required={!form.is24Hours}
                value={form.openUntil}
                onChange={(e) => updateField('openUntil', e.target.value)}
                placeholder={t('closesAtPlaceholder')}
                className="force-ltr w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>
        )}

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
