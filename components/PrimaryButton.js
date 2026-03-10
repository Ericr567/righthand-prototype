import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {SPACING, COLORS} from '../styles/common';

export default function PrimaryButton({title, onPress, style, textStyle, accessibilityLabel}){
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '700',
  },
});