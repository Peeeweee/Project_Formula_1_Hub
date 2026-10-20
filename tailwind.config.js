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
        'f1-dark': '#0a0a0f',
        'f1-panel': '#0f0f18',
        'f1-border': '#1a1a24',
        'f1-muted': '#a3a3b3',
        'f1-light': '#f0f0f0',
      },
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

