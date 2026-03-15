import React, {createContext, useContext, useMemo} from 'react';

const LIGHT_COLORS = {
  primary: '#0B4226',
  onPrimary: '#FFFFFF',
  onPrimaryMuted: 'rgba(255,255,255,0.75)',
  background: '#F5EEE3',
  text: '#0B4226',
  textSecondary: '#36454F',
  border: '#9BB38C',
  accentBrown: '#5C3A21',
  logoSkinTone1: '#A06A42',
  logoSkinTone2: '#6B4027',
  white: '#FFFFFF',
  softGray: '#EFEFEF',
  error: '#B00020',
  successBg: '#EAF6EC',
  successBorder: '#A9D7B0',
  successText: '#1F6A2E',
  dangerBg: '#FDECEC',
  dangerBorder: '#F4C2C2',
  dangerText: '#C62828',
  infoBg: '#EEF2FF',
  infoBorder: '#C7D2FE',
  warningBg: '#FFF8E1',
  warningBorder: '#FFE082',
  subtleBg: '#F5F7FA',
};

const DARK_COLORS = {
  primary: '#6FD09A',
  onPrimary: '#061810',
  onPrimaryMuted: 'rgba(6,24,16,0.75)',
  background: '#0F1412',
  text: '#E8F3ED',
  textSecondary: '#A6B8AE',
  border: '#2A3A33',
  accentBrown: '#C59A7C',
  logoSkinTone1: '#C38B62',
  logoSkinTone2: '#8E5C3D',
  white: '#18201C',
  softGray: '#1E2823',
  error: '#FF6B6B',
  successBg: '#113323',
  successBorder: '#2A6B4A',
  successText: '#88E0AF',
  dangerBg: '#3A1E1E',
  dangerBorder: '#6A2E2E',
  dangerText: '#FF9B9B',
  infoBg: '#1A2338',
  infoBorder: '#334B75',
  warningBg: '#3A2E14',
  warningBorder: '#6A5525',
  subtleBg: '#141B18',
};

const ThemeContext = createContext({
  mode: 'light',
  isDark: false,
  colors: LIGHT_COLORS,
  setMode: () => {},
  toggleMode: () => {},
});

export function ThemeProvider({mode = 'light', setMode = () => {}, children}) {
  const isDark = mode === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  const value = useMemo(() => ({
    mode,
    isDark,
    colors,
    setMode,
    toggleMode: () => setMode(isDark ? 'light' : 'dark'),
  }), [mode, isDark, colors, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function buildNavigationTheme(mode) {
  const isDark = mode === 'dark';
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  return {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };
}
