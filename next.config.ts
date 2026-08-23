import type { NextConfig } from "next";
<<<<<<< HEAD

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
=======
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* your existing config options */
};

export default withNextIntl(nextConfig);
>>>>>>> af30a63d8406f868cc1af175f07ede35d4961a2a
