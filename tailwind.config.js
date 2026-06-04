/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        muted: '#66615A',
        line: '#E4DED2',
        surface: '#F6F3EC',
        'surface-soft': '#FBFAF7',
        card: '#FFFFFF',

        brand: {
          50: '#F2EFE8',
          100: '#E6DFD0',
          500: '#111111',
          600: '#050505',
          700: '#000000',
        },

        gold: {
          50: '#FFF7E4',
          100: '#F6E4B8',
          505: '#D5AD5B',
          500: '#C89B3C',
          600: '#A77E28',
          700: '#785817',
        },

        copper: {
          50: '#FFF7E4',
          100: '#F6E4B8',
          500: '#C89B3C',
          600: '#111111',
          700: '#000000',
        },

        'dark-surface': '#090909',
        'dark-card': '#151515',
        'dark-ink': '#F8F5EE',
        'dark-muted': '#B8B1A3',
        'dark-line': '#2E2A22',
        'dark-brand': {
          50: '#242018',
          500: '#D7B45E',
          600: '#E8C971',
        },
        'dark-gold': {
          50: '#2A2110',
          500: '#D7B45E',
          600: '#E8C971',
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
