/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        muted: '#8A8A8A',
        line: '#E5E5E5',
        surface: '#F9F9FB',
        'surface-soft': '#F4F4F5',
        card: '#FFFFFF',

        brand: {
          50: '#F3F4F6',
          100: '#E5E7EB',
          500: '#111111',
          600: '#050505',
          700: '#000000',
        },

        gold: {
          50: '#F3F4F6',
          100: '#E5E7EB',
          505: '#6B7280',
          500: '#6B7280',
          600: '#111111',
          700: '#000000',
        },

        copper: {
          50: '#F3F4F6',
          100: '#E5E7EB',
          500: '#6B7280',
          600: '#111111',
          700: '#000000',
        },

        'dark-surface': '#0A0A0A',
        'dark-card': '#141414',
        'dark-ink': '#F5F5F5',
        'dark-muted': '#A0A0A0',
        'dark-line': '#2A2A2A',
        'dark-brand': {
          50: '#1F1F1F',
          500: '#E0E0E0',
          600: '#F0F0F0',
        },
        'dark-gold': {
          50: '#1A1A1A',
          500: '#D0D0D0',
          600: '#E0E0E0',
        },
      },
      fontFamily: {
        sans: ['Tajawal', 'System'],
        tajawal: ['Tajawal'],
        'tajawal-medium': ['Tajawal_500Medium'],
        'tajawal-bold': ['Tajawal_700Bold'],
      },
    },
  },
  plugins: [],
};
