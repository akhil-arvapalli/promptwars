import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-syne)', 'sans-serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      colors: {
        flood: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
        urgency: {
          low:    '#16a34a',
          medium: '#d97706',
          high:   '#dc2626',
          critical: '#7c2d12',
        },
      },
      animation: {
        'pulse-urgency': 'pulse-urgency 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slide-up 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'ripple': 'ripple 1.5s linear infinite',
      },
      keyframes: {
        'pulse-urgency': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ripple': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config