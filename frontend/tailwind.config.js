/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ocean: {
          950: '#020617',
          900: '#071328',
          800: '#0c2340',
          700: '#14365d',
          600: '#1d4ed8',
          500: '#0284c7',
          400: '#38bdf8',
          300: '#7dd3fc',
          200: '#bae6fd',
          100: '#e0f2fe',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
        },
        coral: {
          500: '#f43f5e',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
