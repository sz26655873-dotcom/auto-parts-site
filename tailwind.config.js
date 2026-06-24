/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A2342',
          50: '#E8EDF3',
          100: '#C5D1E0',
          200: '#9DB0C8',
          300: '#7590B0',
          400: '#4D7098',
          500: '#1A3A5C',
          600: '#0F2A4E',
          700: '#0A2342',
          800: '#061629',
          900: '#030B15',
        },
        accent: {
          DEFAULT: '#FF6B00',
          light: '#FF8533',
          dark: '#E55A00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
