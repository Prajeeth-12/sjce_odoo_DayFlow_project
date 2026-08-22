import { createTheme } from '@mui/material/styles';
import { colors, shadows, radii } from './tokens';

const theme = createTheme({
  palette: {
    primary: { main: colors.brand[500], light: colors.brand[300], dark: colors.brand[700] },
    secondary: { main: '#F2A900' },
    background: { default: colors.neutral[50], paper: colors.neutral[0] },
    text: { primary: colors.neutral[800], secondary: colors.neutral[500] },
    success: { main: colors.success.main, light: colors.success.light },
    error: { main: colors.error.main, light: colors.error.light },
    warning: { main: colors.warning.main, light: colors.warning.light },
    info: { main: colors.info.main, light: colors.info.light },
    divider: colors.neutral[200],
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600, fontSize: '1rem' },
    subtitle2: { fontWeight: 600, fontSize: '0.875rem', color: colors.neutral[600] },
    body2: { color: colors.neutral[600] },
    button: { textTransform: 'none', fontWeight: 600 },
    caption: { color: colors.neutral[500], fontSize: '0.75rem' },
  },
  shape: { borderRadius: radii.md },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: colors.neutral[50] },
        '*::-webkit-scrollbar': { width: 6, height: 6 },
        '*::-webkit-scrollbar-track': { background: 'transparent' },
        '*::-webkit-scrollbar-thumb': { background: colors.neutral[300], borderRadius: 3 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: shadows.sm,
          border: `1px solid ${colors.neutral[200]}`,
          borderRadius: radii.lg,
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: shadows.cardHover,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: radii.sm,
          boxShadow: 'none',
          padding: '8px 16px',
          '&:hover': { boxShadow: shadows.sm },
        },
        contained: {
          '&:hover': { boxShadow: shadows.md },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: colors.neutral[0],
            borderRadius: radii.md,
            transition: 'box-shadow 200ms ease',
            '& fieldset': { borderColor: colors.neutral[200] },
            '&:hover fieldset': { borderColor: colors.neutral[400] },
            '&.Mui-focused': { boxShadow: shadows.glow },
            '&.Mui-focused fieldset': { borderColor: colors.brand[500] },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: radii.lg },
        elevation1: { boxShadow: shadows.sm },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radii.sm, fontWeight: 500 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 44,
          '&.Mui-selected': { fontWeight: 600 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.neutral[500],
          backgroundColor: colors.neutral[50],
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontSize: '0.875rem', fontWeight: 600 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: radii.xl },
      },
    },
  },
});

export default theme;
