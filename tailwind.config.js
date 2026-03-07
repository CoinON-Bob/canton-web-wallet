/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0A0A0F',
          card: '#111118',
          hover: '#1A1A24',
          active: '#222230',
        },
        primary: {
          DEFAULT: '#00E676',
          light: '#00FF88',
          dark: '#00C853',
        },
        secondary: {
          DEFAULT: '#22D3EE',
          light: '#67E8F9',
          dark: '#06B6D4',
        },
        accent: {
          DEFAULT: '#22C55E',
          light: '#4ADE80',
          dark: '#16A34A',
        },
        border: {
          DEFAULT: '#2D2D3D',
          light: '#3A3A4D',
          dark: '#1F1F2D',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Exo 2', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Orbitron', 'Exo 2', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}