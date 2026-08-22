export const colors = {
  brand: {
    50: '#faf5f9',
    100: '#f0e4ed',
    200: '#e3c9df',
    300: '#c99abb',
    400: '#a96f96',
    500: '#714B67',
    600: '#5f3f57',
    700: '#4f3248',
    800: '#3d2738',
    900: '#2d1a28',
  },
  neutral: {
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  success: { light: '#d1fae5', main: '#10b981', dark: '#047857' },
  warning: { light: '#fef3c7', main: '#f59e0b', dark: '#b45309' },
  error: { light: '#fee2e2', main: '#ef4444', dark: '#b91c1c' },
  info: { light: '#dbeafe', main: '#3b82f6', dark: '#1d4ed8' },
};

export const shadows = {
  xs: '0 1px 2px rgba(0, 0, 0, 0.04)',
  sm: '0 2px 4px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 12px 32px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 48px rgba(0, 0, 0, 0.12)',
  glow: '0 0 0 3px rgba(113, 75, 103, 0.12)',
  cardHover: '0 8px 24px rgba(113, 75, 103, 0.15)',
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const spacing = {
  page: { px: 4, py: 3 },
  section: 3,
  card: 2.5,
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};
