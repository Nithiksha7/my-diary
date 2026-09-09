/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        handwritten: ['"Caveat"', 'cursive'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        cinzel: ['"Cinzel"', 'serif'],
      },
      colors: {
        theme: {
          bg: 'var(--theme-bg)',
          card: 'var(--theme-card)',
          'card-hover': 'var(--theme-card-hover)',
          border: 'var(--theme-border)',
          'border-light': 'var(--theme-border-light)',
          text: 'var(--theme-text)',
          muted: 'var(--theme-muted)',
          accent: 'var(--theme-accent)',
          'accent-glow': 'var(--theme-accent-glow)',
          highlight: 'var(--theme-highlight)',
          paper: 'var(--theme-paper)',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-slow': 'fadeIn 1.4s ease-out forwards',
        'pulse-subtle': 'pulseSubtle 6s ease-in-out infinite',
        'float-gentle': 'floatGentle 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'page-turn': 'pageTurn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.015)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        pageTurn: {
          '0%': { opacity: '0.6', transform: 'translateX(8px) scale(0.995)' },
          '100%': { opacity: '1', transform: 'translateX(0) scale(1)' },
        }
      },
      boxShadow: {
        'journal': '0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 1px 1px var(--theme-border)',
        'polaroid': '0 12px 30px -8px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0,0,0,0.1)',
        'glow': '0 0 25px var(--theme-accent-glow)',
        'candle': '0 0 40px -10px var(--theme-accent-glow)',
      }
    },
  },
  plugins: [],
}
