'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, Lock } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword');

  return (
    <div>
      <Link
        href="/login"
        className="mb-6 flex items-center gap-1 text-sm font-medium text-brand-ink hover:text-brand-navy"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        {t('backToLogin')}
      </Link>

      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <Lock className="h-5 w-5 text-brand-blue" />
      </span>

      <h1 className="text-2xl font-bold text-brand-navy">{t('title')}</h1>
      <p className="mt-2 max-w-sm text-sm text-brand-ink">{t('subtitle')}</p>

      <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            {t('emailLabel')}
          </label>
          <input
            id="email"
            type="text"
            placeholder={t('emailPlaceholder')}
            className="force-ltr w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90"
        >
          {t('submit')}
        </button>
      </form>
    </div>
  );
}
