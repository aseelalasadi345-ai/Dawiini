import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
});

// Locale-aware Link, redirect, usePathname, useRouter
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);