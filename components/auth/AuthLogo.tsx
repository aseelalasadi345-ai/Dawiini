import Image from 'next/image';
import { Link } from '@/i18n/routing';

export default function AuthLogo() {
  return (
    <Link href="/" className="mb-6 flex items-center justify-center">
      <Image
        src="/images/Dawiini_Logo_cropped.png"
        alt="Dawiini"
        width={462}
        height={137}
        priority
        className="h-9 w-auto"
      />
    </Link>
  );
}