import React from 'react';
import {TouchableOpacity, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';

export default function PrimaryButton({
  title,
  onPress,
  style,
  textStyle,
  accessibilityLabel,
  variant = 'primary',
  disabled = false,
  loading = false,
}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const isPrimary = variant === 'primary';

  const buttonStyle = [
    styles.button,
    isPrimary ? styles.primary : styles.secondary,
    (disabled || loading) && styles.buttonDisabled,
    style,
  ];

  const labelColor = isPrimary ? colors.onPrimary : colors.text;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      {loading ? (
        <ActivityIndicator size="small" color={labelColor} />
      ) : (
        <Text style={[styles.text, {color: labelColor}, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
  button: {
    padding: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  primary: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
});