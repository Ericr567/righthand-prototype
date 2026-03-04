import {StyleSheet} from 'react-native';

// Shared colors, spacing and common style objects used across the app
export const COLORS = {
  primary: '#0a84ff',
  background: '#fff',
  text: '#000',
  textSecondary: '#444',
  border: '#ddd',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

export default StyleSheet.create({
  screen: {
    flex: 1,
    padding: SPACING.md,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  question: {
    fontWeight: '600',
    color: COLORS.text,
  },
  answer: {
    marginTop: SPACING.sm,
    color: COLORS.textSecondary,
  },
});