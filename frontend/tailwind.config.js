/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#070709',
          surface: '#09090b',
          dark: '#050507',
        },
      },
      boxShadow: {
        'glow-white': '0 0 25px rgba(255, 255, 255, 0.08)',
        'glow-cta': '0 0 20px rgba(255, 255, 255, 0.20)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.65)',
      },
    },
  },
  plugins: [],
}
