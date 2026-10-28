/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'f1-red': '#e10600',
        'f1-dark': '#080808',
        'f1-panel': '#111111',
        'f1-border': '#292929',
        'f1-muted': '#aaaaaa',
        'f1-light': '#f0f0f0',
      },
      fontFamily: {
        sans: ['Chrono', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

