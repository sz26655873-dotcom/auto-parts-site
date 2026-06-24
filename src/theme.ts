import { createTheme, type Theme } from '@mui/material/styles';

/**
 * Base MUI theme configuration (without direction).
 * Primary: deep navy blue (#0A2342) — conveys trust and industrial feel.
 * Secondary: vibrant orange (#FF6B00) — accent color for CTAs and highlights.
 */
const baseThemeOptions = {
  palette: {
    primary: {
      main: '#0A2342',
      dark: '#061629',
      light: '#1A3A5C',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FF6B00',
      dark: '#E55A00',
      light: '#FF8533',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F8FAFC',
    },
    text: {
      primary: '#0A2342',
      secondary: '#5A6878',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, fontSize: '3.5rem', lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.3 },
    h3: { fontWeight: 700, fontSize: '2rem', lineHeight: 1.4 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.5 },
    h6: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.5 },
    button: { fontWeight: 600, textTransform: 'none' as const },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.95rem',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#061629',
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#E55A00',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(10, 35, 66, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(10, 35, 66, 0.15)',
        },
      },
    },
  },
};

/**
 * Creates a MUI theme with the specified text direction.
 * Used to support RTL layout for Arabic and LTR for other languages.
 *
 * @param direction - 'rtl' for right-to-left, 'ltr' for left-to-right.
 * @returns A configured MUI Theme instance.
 */
export function createAppTheme(direction: 'rtl' | 'ltr'): Theme {
  return createTheme({
    ...baseThemeOptions,
    direction,
  });
}

/**
 * Default LTR theme for backward compatibility.
 * Prefer `createAppTheme()` when direction needs to be dynamic.
 */
const theme = createAppTheme('ltr');

export { theme };
