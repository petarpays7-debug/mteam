import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Osnovna paleta branda
        petrol: {
          DEFAULT: '#061A26',
          50: '#E7EEF2',
          100: '#C6D6DF',
          200: '#93AEBF',
          300: '#5F8499',
          400: '#3A5C70',
          500: '#1F3D4E',
          600: '#123141',
          700: '#0B2532',
          800: '#061A26',
          900: '#04121B',
        },
        ink: '#0B1014',
        paper: '#F5F8F7',
        solar: {
          DEFAULT: '#F5B900',
          soft: '#FFD65C',
          deep: '#C79500',
        },
        ember: {
          DEFAULT: '#FF6B35',
          deep: '#D14B1B',
        },
        cars: {
          DEFAULT: '#C90000',
          soft: '#E23A3A',
          deep: '#8E0000',
        },
      },
      /*
       * Tailwind generira "slash" varijante boja samo za vrijednosti iz ove
       * skale. Zadana skala ima korak od 5 (i 25/75), pa su ovdje dodane
       * medjuvrijednosti koje dizajn stvarno koristi.
       */
      opacity: {
        8: '0.08',
        12: '0.12',
        15: '0.15',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
        97: '0.97',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Montserrat', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'Manrope', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['clamp(2.75rem, 7vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2.25rem, 5vw, 4rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.75rem, 3.4vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-sm': ['clamp(1.35rem, 2.2vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
      },
      maxWidth: {
        shell: '82rem',
        prose: '68ch',
      },
      spacing: {
        section: 'clamp(4.5rem, 9vw, 9rem)',
        13: '3.25rem',
        18: '4.5rem',
      },
      borderRadius: {
        card: '1.25rem',
        shell: '2rem',
      },
      boxShadow: {
        lift: '0 24px 60px -32px rgba(0,0,0,0.65)',
        glow: '0 0 0 1px rgba(245,185,0,0.28), 0 18px 50px -24px rgba(245,185,0,0.35)',
        carsglow: '0 0 0 1px rgba(201,0,0,0.3), 0 18px 50px -24px rgba(201,0,0,0.4)',
      },
      backgroundImage: {
        'grid-fine':
          'linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px)',
        'grid-fine-dark':
          'linear-gradient(to right, rgba(6,26,38,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,26,38,0.07) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '64px 64px',
        'grid-sm': '32px 32px',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translate3d(0, 14px, 0)' },
          to: { opacity: '1', transform: 'translate3d(0, 0, 0)' },
        },
        sheen: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(220%)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.85' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both',
        sheen: 'sheen 2.6s cubic-bezier(0.22,1,0.36,1) infinite',
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
