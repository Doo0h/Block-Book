import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          deep: '#0F172A',
          soft: '#EFF6FF',
        },
      },
      boxShadow: {
        card: '0 20px 60px -35px rgba(15, 23, 42, 0.22)',
      },
      borderRadius: {
        xl2: '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
