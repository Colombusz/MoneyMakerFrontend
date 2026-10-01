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
        // Dark palette
        dark: {
          background: '#232323',
          surface: '#2D2D2D',
          card: '#30302F',
          border: 'rgba(255,255,255,0.08)',
          primary: '#7477FF',
          primaryLight: '#BCF3FF',
          primaryDark: '#5B64D0',
          income: '#9FD5B3',
          incomeLight: '#14532D',
          expense: '#F45E4F',
          expenseLight: '#FF8A78',
          transfer: '#7477FF',
          text: '#F7F7F2',
          textSecondary: '#C5D4CA',
          textMuted: '#979A98',
          accent: '#7477FF',
          success: '#9FD5B3',
          warning: '#F0D35A',
        },
        // Light palette
        light: {
          background: '#F7F7F2',
          surface: '#DDE8E0',
          card: '#C5D4CA',
          border: 'rgba(35,35,35,0.08)',
          primary: '#7477FF',
          primaryLight: '#BCF3FF',
          primaryDark: '#5B64D0',
          income: '#9FD5B3',
          incomeLight: '#D4E8D',
          expense: '#F45E4F',
          expenseLight: '#FF8A78',
          transfer: '#7477FF',
          text: '#232323',
          textSecondary: '#383838',
          textMuted: '#979A98',
          accent: '#7477FF',
          success: '#9FD5B3',
          warning: '#F0D35A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      minHeight: {
        'screen-dvh': '100dvh'
      },
      boxShadow: {
        'subtle': '0 2px 8px rgba(0,0,0,0.08)',
        'subtle-dark': '0 2px 8px rgba(0,0,0,0.3)',
      }
    },
  },
  plugins: [],
}
