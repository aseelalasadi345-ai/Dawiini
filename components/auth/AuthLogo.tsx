import { Link } from '@/i18n/routing';

export default function AuthLogo() {
  return (
    <Link
      href="/"
      className="mb-6 flex items-center justify-center gap-2 text-lg font-bold text-brand-navy"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-gradient text-sm font-bold text-white">
        D
      </span>
      Dawiini
    </Link>
  );
}