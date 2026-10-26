/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: [
        '"Neue Haas Grotesk Display Pro"',
        '"Neue Haas Grotesk Text Pro"',
        '"Neue Haas Grotesk"',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Helvetica Neue"',
        'Helvetica',
        'Arial',
        'sans-serif',
      ],
      mono: [
        '"JetBrains Mono"',
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Monaco',
        'Consolas',
        'monospace',
      ],
    },
    extend: {
      colors: {
        background: '#F8FAFF',
        softbg: '#EEF5FF',
        foreground: '#111827',
        'ink-secondary': '#4B5563',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111827',
        },
        primary: {
          DEFAULT: '#2563EB',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#DBEAFE',
          foreground: '#1E40AF',
        },
        muted: {
          DEFAULT: '#EFF6FF',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#EFF6FF',
          foreground: '#1D4ED8',
        },
        border: 'rgba(37, 99, 235, 0.12)',
        input: 'rgba(37, 99, 235, 0.16)',
        ring: '#3B82F6',

        bright: '#3B82F6',
        softblue: '#DBEAFE',
        paleblue: '#EFF6FF',
        ice: '#2563EB',
        positive: '#059669',
        caution: '#D97706',
        alert: '#DC2626',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glass-card': '0 10px 30px -5px rgba(37, 99, 235, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
        'glass-float': '0 20px 40px -10px rgba(37, 99, 235, 0.14), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'glow-blue': '0 0 25px rgba(37, 99, 235, 0.18)',
        'glow-cta': '0 4px 20px rgba(37, 99, 235, 0.35)',
      },
    },
  },
  plugins: [],
}
