/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,jsx,ts,tsx,}'],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#ff69b4', // Main pink
          light: '#ff85c1',
          dark: '#d14f8b',
        },
        black: '#000000',
        white: '#ffffff',
      },
    },
    plugins: [],
  },
};
