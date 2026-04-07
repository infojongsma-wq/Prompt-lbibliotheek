import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        oost: {
          blauw: '#1361FF',
          paars: '#8F00FF',
          rood: '#FF4242',
          oranje: '#FF6813',
          geel: '#FFAF16',
          groen: '#ABBF3D',
          donkerblauw: '#131720',
          lichtblauw: '#E7EEF9',
        },
      },
      fontFamily: {
        sans: ['Roobert', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
