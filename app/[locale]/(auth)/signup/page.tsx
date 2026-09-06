'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import AuthCard from '@/components/auth/AuthCard';
import AuthLogo from '@/components/auth/AuthLogo';
import SignupForm, { type SignupSubmitValues } from '@/components/auth/SignupForm';
import SignupCheckEmail from '@/components/auth/SignupCheckEmail';
import { useSignup } from '@/hooks/useAuth';
import { ApiError } from '@/lib/axios';

// Mirrors the reference Patients page's own errorMessage() helper exactly —
// ApiError extends Error, so its safe server-provided .message surfaces
// as-is; anything else (network failure, etc.) falls back to a generic
// message rather than an internal error string.
function errorMessage(error: unknown): string | null {
  if (error instanceof ApiError) return error.message;
  return error ? 'Something went wrong. Please try again.' : null;
}

// This page owns all backend interaction for signup: the useSignup
// mutation (Supabase Auth signup + Prisma User row creation happens
// server-side in app/api/auth/signup/route.ts; useSignup just wraps that
// route's axiosPost call — see hooks/useAuth.ts) and everything to do with
// the result (redirect vs. "check your email" vs. surfacing an error).
// SignupForm below is purely presentational — it only knows how to call
// onSubmit(values).
export default function SignupPage() {
  const router = useRouter();
  const signupMutation = useSignup();
  // Set on success when Supabase returned no session (email confirmation
  // required on this project — verified live, see the signup route).
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);

  const handleSubmit = async (values: SignupSubmitValues) => {
    try {
      const response = await signupMutation.mutateAsync(values);
      if (response.data?.needsEmailConfirmation) {
        setPendingConfirmationEmail(values.email);
      } else {
        // Already has a real session (useSignup's onSuccess populated
        // AuthProvider) — onboarding is the existing signed-in flow new
        // accounts go through, and it itself ends at /home.
        router.push('/onboarding?step=1');
      }
    } catch {
      // Nothing else to do — signupMutation.error drives the error prop
      // passed to SignupForm below.
    }
  };

  if (pendingConfirmationEmail) {
    return (
      <AuthCard>
        <AuthLogo />
        <SignupCheckEmail email={pendingConfirmationEmail} />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthLogo />
      <SignupForm
        isSubmitting={signupMutation.isPending}
        error={errorMessage(signupMutation.error)}
        onSubmit={handleSubmit}
      />
    </AuthCard>
  );
}
