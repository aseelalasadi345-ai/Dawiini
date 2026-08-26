'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { signupSchema, type SignupFormValues } from '@/lib/validations/auth';
import { signup } from '@/lib/auth/mockAuth';
import FieldError from './FieldError';

export default function SignupForm() {
  const t = useTranslations('auth.signup');
  const tErrors = useTranslations('auth.errors');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupFormValues) => {
    // TODO: replace with the real signup API call.
    await signup(data);
    router.push('/onboarding?step=1');
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-bold text-brand-navy">{t('title')}</h1>
      <p className="mt-2 text-center text-sm text-brand-ink">{t('subtitle')}</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className="mb-1.5 block text-sm font-semibold text-brand-navy">
              {t('firstNameLabel')}
            </label>
            <input
              id="firstName"
              type="text"
              placeholder={t('firstNamePlaceholder')}
              aria-invalid={!!errors.firstName}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              {...register('firstName')}
            />
            <FieldError message={errors.firstName?.message && tErrors(errors.firstName.message)} />
          </div>
          <div>
            <label htmlFor="lastName" className="mb-1.5 block text-sm font-semibold text-brand-navy">
              {t('lastNameLabel')}
            </label>
            <input
              id="lastName"
              type="text"
              placeholder={t('lastNamePlaceholder')}
              aria-invalid={!!errors.lastName}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              {...register('lastName')}
            />
            <FieldError message={errors.lastName?.message && tErrors(errors.lastName.message)} />
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
            aria-invalid={!!errors.email}
            className="force-ltr w-full rounded-xl border border-brand-border px-4 py-2.5 text-sm text-brand-navy placeholder:text-slate-400 focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
            {...register('email')}
          />
          <FieldError message={errors.email?.message && tErrors(errors.email.message)} />
        </div>

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
          disabled={isSubmitting}
          className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
        >
          {isSubmitting ? t('submitting') : t('submit')}
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
