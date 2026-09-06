import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Run next-intl's own middleware first (locale detection/redirect/rewrite),
  // then layer the refreshed Supabase session cookies onto whatever response
  // it produced, so both concerns work on every matched request.
  const response = intlMiddleware(request);
  return updateSession(request, response);
}

export const config = {
  matcher: ['/', '/(en|ar)/:path*']
};
