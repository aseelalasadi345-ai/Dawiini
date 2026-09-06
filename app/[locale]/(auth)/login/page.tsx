'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import AuthCard from '@/components/auth/AuthCard';
import AuthLogo from '@/components/auth/AuthLogo';
import LoginForm, { type LoginSubmitValues } from '@/components/auth/LoginForm';
import { useLogin } from '@/hooks/useAuth';
import { ApiError } from '@/lib/axios';

// This page owns all backend interaction for login: the useLogin mutation
// (Supabase Auth sign-in happens server-side in app/api/auth/login/route.ts;
// useLogin just wraps that route's axiosPost call — see hooks/useAuth.ts)
// and the redirect-on-success. LoginForm below is purely presentational —
// it only knows how to call onSubmit(values).
export default function LoginPage() {
  const tErrors = useTranslations('auth.errors');
  const router = useRouter();
  const loginMutation = useLogin();

  const handleSubmit = (values: LoginSubmitValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => router.push('/home'),
    });
  };

  // Two distinct failure cases, both translated (never the raw server
  // string, so this stays locale-correct):
  // - 403 = correct credentials, but the account's email isn't confirmed
  //   yet (verified live against this project — Supabase returns
  //   code: "email_not_confirmed", not invalid_credentials, for this case;
  //   see app/api/auth/login/route.ts). Telling the user their email or
  //   password was wrong here would be actively misleading.
  // - anything else = the generic "wrong email or password" message,
  //   which deliberately never reveals which of the two was wrong.
  const error = loginMutation.isError
    ? loginMutation.error instanceof ApiError && loginMutation.error.status === 403
      ? tErrors('emailNotConfirmed')
      : tErrors('loginFailed')
    : null;

  return (
    <AuthCard>
      <AuthLogo />
      <LoginForm isSubmitting={loginMutation.isPending} error={error} onSubmit={handleSubmit} />
    </AuthCard>
  );
}
