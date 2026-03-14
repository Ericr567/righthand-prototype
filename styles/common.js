import {StyleSheet} from 'react-native';

// Shared colors, spacing and common style objects used across the app
export const COLORS = {
  primary: '#0B4226',
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
  subtleBg: '#F5F7FA',
};

export const SPACING = {
  xs: 8,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
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
    fontWeight: '700',
    fontFamily: 'Inter',
    color: COLORS.text,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter',
    color: COLORS.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  mutedText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: COLORS.textSecondary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Inter',
    lineHeight: 22,
    color: COLORS.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '300',
    fontFamily: 'Inter',
    lineHeight: 16,
    color: COLORS.textSecondary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
    color: '#fff',
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    minHeight: 54,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    color: COLORS.text,
    backgroundColor: COLORS.white,
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
    borderRadius: 12,
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