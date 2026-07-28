/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          ink: '#22212B',
          cream: '#F4EEDD',
          red: '#D6293E',
          yellow: '#FFD666',
          cyan: '#5FD0E0',
          green: '#7ED47E',
          darkbg: '#1a1922',
        },
      },
      fontWeight: {
        black: '900',
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
}