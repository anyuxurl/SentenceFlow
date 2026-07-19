/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        chinese: ['Noto Sans SC', 'sans-serif'],
      },
      colors: {
        slate: { 850: '#151e2e', 950: '#0b111b' },
        sky: { 500: '#0ea5e9', 600: '#0284c7' },
      },
    },
  },
  plugins: [],
};
