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
      // Every stack ends in installed system faces, so a blocked or retired
      // font CDN degrades to a real typeface rather than the browser default.
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        chinese: [
          'Noto Sans SC',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'Source Han Sans SC',
          'sans-serif',
        ],
      },
      colors: {
        slate: { 850: '#151e2e', 950: '#0b111b' },
        sky: { 500: '#0ea5e9', 600: '#0284c7' },
      },
    },
  },
  plugins: [],
};
