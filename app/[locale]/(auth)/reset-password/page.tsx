import { Suspense } from 'react';
import AuthCard from '@/components/auth/AuthCard';
import AuthLogo from '@/components/auth/AuthLogo';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <AuthLogo />
      {/* ResetPasswordForm reads the `?error=invalid` search param via
          useSearchParams(), which requires a Suspense boundary for
          next build's static rendering — see app/api/auth/confirm's
          redirect, the only real source of that param. */}
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
