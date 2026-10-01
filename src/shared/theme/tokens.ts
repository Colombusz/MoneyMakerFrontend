export const theme = {
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
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
  },
  radii: {
    sm: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    xxl: '1.25rem', // 20px
    full: '9999px'
  },
  typography: {
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  }
} as const;

export type ThemeTokens = typeof theme;
