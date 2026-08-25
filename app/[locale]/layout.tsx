import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { routing } from '@/i18n/routing';
import '../globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-en' });
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ar',
});

export const metadata: Metadata = {
  title: 'Dawiini — Find your medication, find your pharmacy',
  description:
    'Dawiini helps you locate medications, check pharmacy availability, and manage your health—all in one place.',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${plexArabic.variable}`}>
      <body className={locale === 'ar' ? 'font-arabic' : 'font-sans'}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
