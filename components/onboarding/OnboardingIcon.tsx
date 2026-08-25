import type { ElementType } from 'react';

export default function OnboardingIcon({ icon: Icon }: { icon: ElementType }) {
  return (
    <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
      <Icon className="h-7 w-7 text-brand-blue" />
    </span>
  );
}
