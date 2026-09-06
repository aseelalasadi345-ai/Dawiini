'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validations/auth';
import { useResetPassword } from '@/hooks/useAuth';
import { ApiError } from '@/lib/axios';
import FieldError from './FieldError';

// This page is only ever reached via the emailed reset link, after
// app/api/auth/confirm has exchanged its one-time code for a session (see
// that route's comment) — `?error=invalid` is how it tells us that exchange
// failed (missing/expired/already-used code) instead of silently rendering
// a form that can never succeed.
export default function ResetPasswordForm() {
  const t = useTranslations('auth.resetPassword');
  const tErrors = useTranslations('auth.errors');
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [invalid, setInvalid] = useState(searchParams.get('error') === 'invalid');
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setFormError(null);
    try {
      await resetPassword.mutateAsync({ password: data.password });
      setSubmitted(true);
    } catch (err) {
      if (!(err instanceof ApiError)) {
        setFormError(t('error'));
        return;
      }
      if (err.status === 401) {
        // The recovery session is gone by the time of submit (link already
        // used, expired, or opened somewhere that never established one) —
        // the same dead end as arriving with ?error=invalid, so it gets the
        // same view instead of a raw error.
        setInvalid(true);
      } else if (err.status === 409) {
        // Reusing the current password — a real, specific case (verified
        // live: submitting it previously just did nothing visible, which is
        // the bug this branch fixes), shown under the password field like
        // any other password validation error.
        setError('password', { message: 'samePassword' });
      } else {
        setFormError(t('error'));
      }
    }
  };

  if (invalid) {
    return (
      <div>
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-light">
          <KeyRound className="h-5 w-5 text-danger-strong" />
        </span>
        <h1 className="text-2xl font-bold text-brand-navy">{t('invalidTitle')}</h1>
        <p className="mt-2 max-w-sm text-sm text-brand-ink">{t('invalidMessage')}</p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div>
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
          <CheckCircle2 className="h-5 w-5 text-brand-blue" />
        </span>
        <h1 className="text-2xl font-bold text-brand-navy">{t('successTitle')}</h1>
        <p className="mt-2 max-w-sm text-sm text-brand-ink">{t('successMessage')}</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:opacity-90"
        >
          {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
        <KeyRound className="h-5 w-5 text-brand-blue" />
      </span>

      <h1 className="text-2xl font-bold text-brand-navy">{t('title')}</h1>
      <p className="mt-2 max-w-sm text-sm text-brand-ink">{t('subtitle')}</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            {t('passwordLabel')}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              aria-invalid={!!errors.password}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 pe-11 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              {...register('password')}
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
          {errors.password?.message ? (
            <FieldError message={tErrors(errors.password.message)} />
          ) : (
            <p className="mt-1.5 text-xs text-slate-400">{t('passwordHint')}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-brand-navy">
            {t('confirmPasswordLabel')}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              aria-invalid={!!errors.confirmPassword}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 pe-11 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              {...register('confirmPassword')}
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
          <FieldError message={errors.confirmPassword?.message && tErrors(errors.confirmPassword.message)} />
        </div>

        {formError && <p className="text-sm text-danger-strong">{formError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </button>
      </form>
    </div>
  );
}
