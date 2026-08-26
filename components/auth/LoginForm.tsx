'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { loginSchema, type LoginFormValues } from '@/lib/validations/auth';
import { login } from '@/lib/auth/mockAuth';
import FieldError from './FieldError';
import GoogleIcon from './GoogleIcon';

export default function LoginForm() {
  const t = useTranslations('auth.login');
  const tErrors = useTranslations('auth.errors');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoginFailed(false);
    try {
      // TODO: replace with the real login API call.
      await login(data);
      router.push('/home');
    } catch {
      setLoginFailed(true);
    }
  };

  return (
    <div>
      <h1 className="text-center text-2xl font-bold text-brand-navy">{t('title')}</h1>
      <p className="mt-2 text-center text-sm text-brand-ink">{t('subtitle')}</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {loginFailed && (
          <p
            className="rounded-xl border border-danger-light-border bg-danger-light px-4 py-2.5 text-sm text-danger-strong"
            role="alert"
          >
            {tErrors('loginFailed')}
          </p>
        )}

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
            {...register('email', { onChange: () => setLoginFailed(false) })}
          />
          <FieldError message={errors.email?.message && tErrors(errors.email.message)} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-brand-navy">
              {t('passwordLabel')}
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-brand-blue hover:underline">
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              aria-invalid={!!errors.password}
              className="w-full rounded-xl border border-brand-border px-4 py-2.5 pe-11 text-sm text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue"
              {...register('password', { onChange: () => setLoginFailed(false) })}
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
          <FieldError message={errors.password?.message && tErrors(errors.password.message)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-brand-ink">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
            {...register('rememberMe')}
          />
          {t('rememberMe')}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-brand-gradient py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50"
        >
          {isSubmitting ? t('loggingIn') : t('submit')}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-brand-border" />
        <span className="text-xs text-slate-400">{t('orContinueWith')}</span>
        <div className="h-px flex-1 bg-brand-border" />
      </div>

      <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-brand-border py-2.5 text-sm font-medium text-brand-navy hover:bg-brand-mist">
        <GoogleIcon className="h-5 w-5" />
        {t('continueWithGoogle')}
      </button>

      <p className="mt-6 text-center text-sm text-brand-ink">
        {t('noAccount')}{' '}
        <Link href="/signup" className="font-semibold text-brand-blue hover:underline">
          {t('signUpLink')}
        </Link>
      </p>
    </div>
  );
}
