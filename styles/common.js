import {StyleSheet} from 'react-native';

// Shared colors, spacing and common style objects used across the app
export const COLORS = {
  primary: '#0a84ff',
  background: '#fff',
  text: '#000',
  textSecondary: '#444',
  border: '#ddd',
  successBg: '#EAF6EC',
  successBorder: '#A9D7B0',
  successText: '#1F6A2E',
  dangerBg: '#FDECEC',
  dangerBorder: '#F4C2C2',
  dangerText: '#C62828',
  subtleBg: '#F5F7FA',
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
  titleBlock: {
    marginBottom: SPACING.md,
  },
  sectionBlock: {
    marginTop: SPACING.md,
  },
  sectionBlockTight: {
    marginTop: SPACING.sm,
  },
  display: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  mutedText: {
    color: COLORS.textSecondary,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  listItem: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dangerButton: {
    marginTop: SPACING.md,
    backgroundColor: COLORS.dangerBg,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: COLORS.dangerText,
    fontWeight: '700',
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