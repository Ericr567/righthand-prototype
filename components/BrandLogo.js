import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {COLORS, SPACING} from '../styles/common';

export default function BrandLogo({
  size = 48,
  showWordmark = true,
  style,
  imageSource,
  imageUri,
  imageStyle,
  accessibilityLabel = 'RightHand logo',
}) {
  const handWidth = size * 0.58;
  const handHeight = size * 0.44;
  const resolvedImageSource = imageSource || (imageUri ? {uri: imageUri} : null);

  return (
    <View style={[styles.clearSpace, {padding: size * 0.5}, style]}>
      <View style={styles.row}>
        {resolvedImageSource ? (
          <Image
            source={resolvedImageSource}
            accessibilityRole="image"
            accessibilityLabel={accessibilityLabel}
            resizeMode="contain"
            style={[
              styles.logoImage,
              {
                width: size,
                height: size,
              },
              imageStyle,
            ]}
          />
        ) : (
          <View style={[styles.iconWrap, {width: size, height: size}]}>
            <View
              style={[
                styles.hand,
                {
                  width: handWidth,
                  height: handHeight,
                  backgroundColor: COLORS.logoSkinTone1,
                  left: size * 0.06,
                  top: size * 0.26,
                },
              ]}
            />
            <View
              style={[
                styles.hand,
                {
                  width: handWidth,
                  height: handHeight,
                  backgroundColor: COLORS.logoSkinTone2,
                  right: size * 0.06,
                  top: size * 0.26,
                },
              ]}
            />
            <View
              style={[
                styles.join,
                {
                  width: size * 0.34,
                  height: size * 0.22,
                  left: size * 0.33,
                  top: size * 0.36,
                },
              ]}
            />
          </View>
        )}

        {showWordmark && <Text style={styles.wordmark}>RightHand</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clearSpace: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    position: 'relative',
  },
  logoImage: {
    borderRadius: 8,
  },
  hand: {
    position: 'absolute',
    borderRadius: 999,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  join: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.accentBrown,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  wordmark: {
    marginLeft: SPACING.lg,
    color: COLORS.primary,
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: -0.4,
  },
});
