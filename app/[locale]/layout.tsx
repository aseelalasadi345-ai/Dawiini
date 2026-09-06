import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Providers from "@/components/Providers";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { IAuthUser } from "@/interfaces/interfaces";
import "../globals.css";
// Self-hosted fonts (bundled in node_modules, no runtime fetch to Google's
// CDN) — see the comment above --font-en/--font-ar in globals.css for why
// this replaced next/font/google. Weights match what's actually used by
// Tailwind's font-* classes in this app (normal/medium/semibold/bold, plus
// extrabold for Inter only — IBM Plex Sans Arabic tops out at 700 upstream,
// same ceiling the old next/font/google config had).
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";

export const metadata: Metadata = {
  title: "Dawiini — Find your medication, find your pharmacy",
  description:
    "Dawiini helps you locate medications, check pharmacy availability, and manage your health—all in one place.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Resolved server-side so AuthProvider is seeded correctly on first paint
  // (see components/Providers.tsx) instead of starting signed-out and
  // flashing once a client-side fetch resolves.
  const sessionUser = await getSessionUser();
  const initialUser: IAuthUser | null = sessionUser
    ? await prisma.user.findUnique({ where: { id: sessionUser.id } }).then((u) =>
        u ? { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, role: u.role } : null
      )
    : null;

  return (
    <html lang={locale} dir={dir}>
      <body className={locale === "ar" ? "font-arabic" : "font-sans"}>
        <Providers initialUser={initialUser}>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
