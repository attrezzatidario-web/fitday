/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          black: '#000000',
          surface: '#161616',
          card: '#1C1C1E',
          card2: '#242426',
          border: '#2C2C2E',
          muted: '#8E8E93'
        },
        move: { DEFAULT: '#FA114F', dim: '#FA114F33' },
        exercise: { DEFAULT: '#A6FF00', dim: '#A6FF0033' },
        stand: { DEFAULT: '#0AF1F2', dim: '#0AF1F233' },
        steps: { DEFAULT: '#B983FF', dim: '#B983FF33' },
        accent: {
          blue: '#0A84FF',
          orange: '#FF9F0A',
          yellow: '#FFD60A',
          pink: '#FF375F',
          teal: '#64D2FF'
        }
      },
      fontFamily: {
        display: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
        text: ['"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif']
      },
      borderRadius: {
        card: '22px',
        pill: '999px'
      },
      boxShadow: {
        card: '0 8px 30px rgba(0,0,0,0.45)',
        glow: '0 0 24px rgba(255,255,255,0.06)'
      },
      keyframes: {
        'ring-fill': {
          from: { strokeDashoffset: 'var(--ring-start)' },
          to: { strokeDashoffset: 'var(--ring-end)' }
        },
        'fade-up': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' }
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' }
        },
        'pop': {
          '0%': { transform: 'scale(0.96)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 }
        }
      },
      animation: {
        'ring-fill': 'ring-fill 1.1s cubic-bezier(0.65,0,0.35,1) forwards',
        'fade-up': 'fade-up 0.35s ease-out forwards',
        'sheet-up': 'sheet-up 0.28s cubic-bezier(0.32,0.72,0,1) forwards',
        'pop': 'pop 0.2s ease-out forwards'
      }
    }
  },
  plugins: []
}
