import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all paths except static files, _next, and api routes
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};