'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function HomeGreeting({ name }: { name: string }) {
  const t = useTranslations('home');
  const locale = useLocale();

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12 ? 'greetingMorning' : hour < 18 ? 'greetingAfternoon' : 'greetingEvening';

  const today = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="mb-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-brand-navy sm:text-3xl">
        {t(greetingKey, { name })} <span>👋</span>
      </h1>
      <p className="mt-1 text-sm text-slate-400">{today}</p>
    </div>
  );
}
