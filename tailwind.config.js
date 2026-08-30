/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          midnight: '#0B0F19',
          'midnight-card': '#131C2E',
          'midnight-card-elevated': '#17233B',
          navy: '#0F172A',
          slate: '#334155',
          teal: '#0D9488',
          'teal-dark': '#0F766E',
          'teal-light': '#14B8A6',
          'teal-subtle': '#CCFBF1',
          amber: '#D97706',
          'amber-light': '#F59E0B',
          'amber-subtle': '#FEF3C7',
          surface: '#FFFFFF',
          bg: '#F8FAFC',
          muted: '#64748B',
          subtle: '#94A3B8',
          border: '#E2E8F0',
          'border-dark': '#1E293B',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'card': '0 4px 12px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.02)',
        'elevated': '0 12px 28px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
        'teal': '0 4px 20px 0 rgba(20, 184, 166, 0.35)',
        'glow': '0 0 25px 0 rgba(20, 184, 166, 0.25)',
        'glow-lg': '0 0 40px 0 rgba(20, 184, 166, 0.35)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      padding: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },
    },
  },
  plugins: [],
}
