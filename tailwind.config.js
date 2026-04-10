/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          light: '#f1e5ac',
          DEFAULT: '#d4af37',
          dark: '#9a7b2c',
        },
        charcoal: {
          DEFAULT: '#0a0a0a',
          lighter: '#1a1a1a',
        }
      },
      fontFamily: {
        arabic: ['Noto Sans Arabic', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
