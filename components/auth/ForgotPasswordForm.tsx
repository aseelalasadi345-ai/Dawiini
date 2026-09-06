'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, Lock, MailCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validations/auth';
import { useForgotPassword } from '@/hooks/useAuth';
import FieldError from './FieldError';

export default function ForgotPasswordForm() {
  const t = useTranslations('auth.forgotPassword');
  const tErrors = useTranslations('auth.errors');
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const forgotPassword = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    // Real Supabase Auth request (see app/api/auth/forgot-password/route.ts).
    // The success state below is shown regardless of whether the email
    // exists, by design — see that route's comment on why. Only a genuine
    // network/server failure (never "email not found") reaches the catch.
    try {
      await forgotPassword.mutateAsync({ email: data.email, locale });
      setSubmitted(true);
    } catch {
      // forgotPassword.isError below renders the message.
    }
  };

  return (
    <div>
      <Link
        href="/login"
        className="mb-6 flex items-center gap-1 text-sm font-medium text-brand-ink hover:text-brand-navy"
      >
        <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        {t('backToLogin')}
      </Link>

      {submitted ? (
        <>
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <MailCheck className="h-5 w-5 text-brand-blue" />
          </span>
          <h1 className="text-2xl font-bold text-brand-navy">{t('successTitle')}</h1>
          <p className="mt-2 max-w-sm text-sm text-brand-ink">{t('successMessage')}</p>
        </>
      ) : (
        <>
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            <Lock className="h-5 w-5 text-brand-blue" />
          </span>

          <h1 className="text-2xl font-bold text-brand-navy">{t('title')}</h1>
          <p className="mt-2 max-w-sm text-sm text-brand-ink">{t('subtitle')}</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-brand-navy">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                type="text"
                placeholder={t('emailPlaceholder')}
                aria-invalid={!!errors.email}
                className="force-ltr w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
                {...register('email')}
              />
              <FieldError message={errors.email?.message && tErrors(errors.email.message)} />
            </div>

            {forgotPassword.isError && (
              <p className="text-sm text-danger-strong">{t('error')}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
