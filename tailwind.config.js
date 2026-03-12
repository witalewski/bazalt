/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        muted: '#666666',
        border: '#E5E5E5',
        subtle: '#F5F5F5',
        error: '#FF0000',
        success: '#00FF00',
      },
      fontFamily: {
        mono: ['Menlo', 'monospace'],
      },
      borderRadius: {
        none: '0',
        sm: '2px',
        md: '4px',
      },
    },
  },
  plugins: [],
};
