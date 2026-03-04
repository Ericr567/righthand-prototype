import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import common, {SPACING, COLORS} from '../styles/common';

export default function Header({title, style, titleStyle}){
  return (
    <View style={[styles.container, style]}>
      <Text style={[common.title, styles.title, titleStyle]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
  },
});