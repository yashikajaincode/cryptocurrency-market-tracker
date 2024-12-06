/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'crypto-blue': {
          50: '#e6f1ff',
          100: '#b3d7ff',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        'crypto-dark': {
          800: '#1f2937',
          900: '#111827',
        }
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
    },
  },
  plugins: [],
}