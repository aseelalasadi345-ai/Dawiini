import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2F6FED',
          teal: '#22C1C3',
          navy: '#0F172A',
          ink: '#334155',
          mist: '#F5F7FB',
          border: '#E7EBF3',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #2F6FED 0%, #22C1C3 100%)',
      },
      fontFamily: {
        sans: ['var(--font-en)', 'system-ui', 'sans-serif'],
        arabic: ['var(--font-ar)', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;