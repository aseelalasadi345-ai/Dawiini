import { useTranslations } from 'next-intl';
import { MailCheck } from 'lucide-react';
import { Link } from '@/i18n/routing';

// Purely presentational — shown by signup/page.tsx after a successful
// signup when Supabase returned no session (email confirmation required on
// this project, see app/api/auth/signup/route.ts's needsEmailConfirmation).
// Deciding *when* to show this belongs to the page (it's a post-mutation
// state transition); this component only renders it.
export default function SignupCheckEmail({ email }: { email: string }) {
  const t = useTranslations('auth.signup');

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-mist">
        <MailCheck className="h-6 w-6 text-brand-blue" />
      </div>
      <h1 className="text-2xl font-bold text-brand-navy">{t('checkEmailTitle')}</h1>
      <p className="mt-2 text-sm text-brand-ink">{t('checkEmailMessage', { email })}</p>
      <Link href="/login" className="mt-6 inline-block font-semibold text-brand-blue hover:underline">
        {t('loginLink')}
      </Link>
    </div>
  );
}
