'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import OnboardingIcon from './OnboardingIcon';
import StepDots from './StepDots';
import { Globe2 } from 'lucide-react';

export default function LanguageStep({
  onContinue,
  onSkip,
}: {
  onContinue: (locale: 'en' | 'ar') => void;
  onSkip: () => void;
}) {
  const t = useTranslations('onboarding');
  const currentLocale = useLocale();
  const [selected, setSelected] = useState<'en' | 'ar'>(currentLocale as 'en' | 'ar');

  const options = [
    { locale: 'en' as const, flag: '🇬🇧', name: t('language.english') },
    { locale: 'ar' as const, flag: '🇸🇦', name: t('language.arabic') },
  ];

  return (
    <div className="mx-auto max-w-md text-center">
      <StepDots step={1} />
      <OnboardingIcon icon={Globe2} />
      <h1 className="text-2xl font-bold text-brand-navy">{t('language.title')}</h1>
      <p className="mt-3 text-sm text-brand-ink">{t('language.subtitle')}</p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {options.map((opt) => (
          <button
            key={opt.locale}
            type="button"
            onClick={() => setSelected(opt.locale)}
            className={
              'rounded-2xl border p-5 text-center transition ' +
              (selected === opt.locale
                ? 'border-brand-blue bg-blue-50'
                : 'border-brand-border bg-white hover:bg-brand-mist')
            }
          >
            <span className="force-ltr block text-2xl">{opt.flag}</span>
            <p
              className={
                'mt-2 text-base font-semibold ' +
                (selected === opt.locale ? 'text-brand-blue' : 'text-brand-navy')
              }
            >
              {opt.name}
            </p>
            {selected === opt.locale && (
              <p className="mt-1 text-xs font-medium text-brand-blue">✓ {t('language.selected')}</p>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => onContinue(selected)}
        className="mt-8 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90"
      >
        {t('language.continue')} →
      </button>

      <button onClick={onSkip} className="mt-5 text-sm text-slate-400 hover:text-brand-navy">
        {t('skipThisStep')}
      </button>

      <p className="mt-6 text-xs text-slate-400">{t('stepOf', { step: 1, total: 3 })}</p>
    </div>
  );
}
