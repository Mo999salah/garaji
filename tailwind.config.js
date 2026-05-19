/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#10201B',
        muted: '#66736F',
        line: '#DDE5E1',
        surface: '#F7FAF8',
        brand: {
          50: '#EAF8EF',
          100: '#CFF0DB',
          500: '#22A45D',
          600: '#17864A',
          700: '#11673A',
        },
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
