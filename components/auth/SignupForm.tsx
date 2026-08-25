'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';

export default function SignupForm() {
  const t = useTranslations('auth.signup');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with the real signup API call before redirecting.
    router.push('/onboarding?step=1');
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-bold text-brand-navy">{t('title')}</h1>
      <p className="mt-2 text-center text-sm text-brand-ink">{t('subtitle')}</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-semibold text-brand-navy">
              {t('firstNameLabel')}
            </label>
            <input
              id="firstName"
              type="text"
              placeholder={t('firstNamePlaceholder')}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-semibold text-brand-navy">
              {t('lastNameLabel')}
            </label>
            <input
              id="lastName"
              type="text"
              placeholder={t('lastNamePlaceholder')}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
          </div>
        </div>

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

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            {t('passwordLabel')}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 pe-11 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">{t('passwordHint')}</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            {t('confirmPasswordLabel')}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 pe-11 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 end-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-start gap-2 text-sm text-brand-ink">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
          />
          <span>
            {t('agreeText')}{' '}
            <a href="/terms" className="font-medium text-brand-blue hover:underline">
              {t('termsOfService')}
            </a>{' '}
            {t('and')}{' '}
            <a href="/privacy" className="font-medium text-brand-blue hover:underline">
              {t('privacyPolicy')}
            </a>
            .
          </span>
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90"
        >
          {t('submit')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-ink">
        {t('haveAccount')}{' '}
        <Link href="/login" className="font-semibold text-brand-blue hover:underline">
          {t('loginLink')}
        </Link>
      </p>
    </div>
  );
}

