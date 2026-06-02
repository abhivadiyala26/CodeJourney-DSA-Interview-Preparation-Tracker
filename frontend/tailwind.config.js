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
        // Slate-rich darks + Indigo/Violet accents
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          350: '#b4a0fd',
          400: '#a78bfa',
          450: '#906df9',
          500: '#8b5cf6', // main accent violet
          600: '#7c3aed',
          650: '#6d23ea',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#1e1b4b',
        },
        slate: {
          55: '#f4f7fa',
          250: '#d7dee8',
          350: '#b9c7d9',
          405: '#8a9cb5',
          450: '#7e91a9',
          455: '#7b8da5',
          550: '#556880',
          650: '#3d4d61',
          655: '#3b4a5d',
          750: '#283547',
          850: '#161e2d',
          855: '#131a27',
          880: '#0e1520',
          955: '#060a13',
        },
        rose: {
          350: '#fca5a5',
          450: '#f43f5e',
          455: '#e11d48',
          955: '#4c0519',
        },
        emerald: {
          450: '#34d399',
        },
        amber: {
          450: '#fbbf24',
          650: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
      }
    },
  },
  plugins: [],
}
