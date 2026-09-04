'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import OnboardingHeader from '@/components/onboarding/OnboardingHeader';
import LanguageStep from '@/components/onboarding/LanguageStep';
import LocationStep from '@/components/onboarding/LocationStep';
import NotificationsStep from '@/components/onboarding/NotificationsStep';

function OnboardingFlow() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const step = Number(searchParams.get('step') ?? '1');

  const goToStep = (n: number) => {
    router.push(`${pathname}?step=${n}`);
  };

  return (
    <>
      {step === 1 && (
        <LanguageStep
          onContinue={(locale) => {
            // Switch the site language AND move to step 2 in one navigation.
            router.replace(`${pathname}?step=2`, { locale });
          }}
          onSkip={() => goToStep(2)}
        />
      )}
      {step === 2 && (
        <LocationStep onContinue={() => goToStep(3)} onSkip={() => goToStep(3)} />
      )}
      {step === 3 && (
        <NotificationsStep onFinish={() => router.push('/home')} onSkip={() => router.push('/home')} />
      )}
    </>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-brand-mist">
      <OnboardingHeader />
      <div className="px-6 py-10">
        <Suspense fallback={null}>
          <OnboardingFlow />
        </Suspense>
      </div>
    </div>
  );
}
