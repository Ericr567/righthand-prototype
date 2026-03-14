import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import common, {SPACING, COLORS} from '../styles/common';
import BrandLogo from './BrandLogo';
import {BRANDING} from '../assets/branding';

export default function Header({
  title,
  style,
  titleStyle,
  showLogo = true,
  logoSize = 28,
}){
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        {showLogo && (
          <BrandLogo
            size={logoSize}
            showWordmark={false}
            imageSource={BRANDING.logoSource}
            imageUri={BRANDING.logoUri}
          />
        )}
        <Text style={[common.title, styles.title, titleStyle]}>{title}</Text>
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: 18,
  },
});