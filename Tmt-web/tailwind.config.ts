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
        cream:    '#FAF7F2',
        blush:    '#F5E6DC',
        border:   '#E8DDD4',
        burgundy: '#7D1F1F',
        'burg-dk':'#5C1616',
        charcoal: '#1C1A18',
        muted:    '#8A8278',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Jost', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
