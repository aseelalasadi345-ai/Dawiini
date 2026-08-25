'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, Check } from 'lucide-react';
import OnboardingIcon from './OnboardingIcon';
import StepDots from './StepDots';

export default function LocationStep({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip: () => void;
}) {
  const t = useTranslations('onboarding');
  const [enabled, setEnabled] = useState(false);

  const handleAllow = () => {
    // Ask the browser for permission; the demo state below shows regardless of the
    // real result so the UI can be exercised without a live location fix.
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setEnabled(true),
        () => setEnabled(true),
      );
    } else {
      setEnabled(true);
    }
  };

  return (
    <div className="mx-auto max-w-md text-center">
      <StepDots step={2} />
      <OnboardingIcon icon={MapPin} />
      <h1 className="text-2xl font-bold text-brand-navy">{t('location.title')}</h1>
      <p className="mt-3 text-sm text-brand-ink">{t('location.subtitle')}</p>

      {!enabled ? (
        <button
          type="button"
          onClick={handleAllow}
          className="mt-8 flex w-full items-center gap-3 rounded-xl border border-dashed border-brand-border bg-white p-4 text-start hover:bg-brand-mist"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
            <MapPin className="h-5 w-5 text-brand-blue" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-brand-navy">
              {t('location.allowTitle')}
            </span>
            <span className="block text-xs text-slate-400">{t('location.allowSubtitle')}</span>
          </span>
        </button>
      ) : (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-start">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <Check className="h-5 w-5 text-emerald-600" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-emerald-700">
              {t('location.enabledTitle')}
            </span>
            <span className="block text-xs text-emerald-600">{t('location.enabledSubtitle')}</span>
          </span>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">{t('location.privacyNote')}</p>

      <button
        onClick={onContinue}
        className="mt-6 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90"
      >
        {t('location.continue')} →
      </button>

      <button onClick={onSkip} className="mt-5 text-sm text-slate-400 hover:text-brand-navy">
        {t('skipThisStep')}
      </button>

      <p className="mt-6 text-xs text-slate-400">{t('stepOf', { step: 2, total: 3 })}</p>
    </div>
  );
}
