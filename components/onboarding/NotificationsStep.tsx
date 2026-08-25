'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, AlarmClock, CheckCircle2 } from 'lucide-react';
import OnboardingIcon from './OnboardingIcon';
import StepDots from './StepDots';

export default function NotificationsStep({
  onFinish,
  onSkip,
}: {
  onFinish: () => void;
  onSkip: () => void;
}) {
  const t = useTranslations('onboarding');
  const [enabled, setEnabled] = useState(false);

  const handleAllow = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().finally(() => setEnabled(true));
    } else {
      setEnabled(true);
    }
  };

  return (
    <div className="mx-auto max-w-md text-center">
      <StepDots step={3} />
      <OnboardingIcon icon={Bell} />
      <h1 className="text-2xl font-bold text-brand-navy">{t('notifications.title')}</h1>
      <p className="mt-3 text-sm text-brand-ink">{t('notifications.subtitle')}</p>

      {!enabled ? (
        <button
          type="button"
          onClick={handleAllow}
          className="mt-8 flex w-full items-center gap-3 rounded-xl border border-dashed border-brand-border bg-white p-4 text-start hover:bg-brand-mist"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50">
            <Bell className="h-5 w-5 text-amber-500" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-brand-navy">
              {t('notifications.allowTitle')}
            </span>
            <span className="block text-xs text-slate-400">{t('notifications.allowSubtitle')}</span>
          </span>
        </button>
      ) : (
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-start">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-emerald-700">
              {t('notifications.enabledTitle')}
            </span>
            <span className="block text-xs text-emerald-600">{t('notifications.enabledSubtitle')}</span>
          </span>
        </div>
      )}

      <div className="mt-4 space-y-2 text-start">
        <div className="flex items-center gap-2 rounded-xl border border-brand-border px-4 py-3">
          <AlarmClock className="h-4 w-4 shrink-0 text-rose-400" />
          <span className="text-sm text-brand-ink">{t('notifications.sample1')}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-brand-border px-4 py-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span className="text-sm text-brand-ink">{t('notifications.sample2')}</span>
        </div>
      </div>

      <button
        onClick={onFinish}
        className="mt-6 w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90"
      >
        {t('notifications.letsGo')} →
      </button>

      <button onClick={onSkip} className="mt-5 text-sm text-slate-400 hover:text-brand-navy">
        {t('skipThisStep')}
      </button>
    </div>
  );
}
