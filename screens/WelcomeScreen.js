import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import common, {SPACING} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';
import BrandLogo from '../components/BrandLogo';
import {BRANDING} from '../assets/branding';
import {useAppTheme} from '../theme/ThemeContext';

export default function WelcomeScreen({navigation}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={[common.screen, styles.screen, {backgroundColor: colors.background}]}> 
      <View style={styles.bgOrbOne} />
      <View style={styles.bgOrbTwo} />

      <View style={styles.heroCard}>
        <View style={styles.logoWrap}>
          <BrandLogo
            size={56}
            imageSource={BRANDING.logoSource}
            imageUri={BRANDING.logoUri}
          />
        </View>
        <Text style={[common.display, styles.headline]}>Build Bill Confidence, Fast</Text>
        <Text style={[common.body, styles.tag]}>
          RightHand helps you plan upcoming bills, automate savings, and stay ahead of due dates.
        </Text>

        <View style={styles.bulletList}>
          <Text style={styles.bulletItem}>Track upcoming bills with risk alerts</Text>
          <Text style={styles.bulletItem}>Auto-save by fixed amount or paycheck percent</Text>
          <Text style={styles.bulletItem}>Connect your bank securely with Plaid</Text>
        </View>

        <PrimaryButton
          title="Get Started"
          onPress={() => navigation.navigate('Signup')}
          style={styles.button}
        />
        <PrimaryButton
          title="Explore Dashboard"
          variant="secondary"
          onPress={() => navigation.replace('Main')}
          style={styles.secondaryButton}
        />
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  screen: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    overflow: 'hidden',
  },
  bgOrbOne: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: colors.successBg,
  },
  bgOrbTwo: {
    position: 'absolute',
    bottom: -70,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.infoBg,
  },
  heroCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  logoWrap: {
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
  },
  headline: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
  },
  tag: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    color: colors.textSecondary,
  },
  bulletList: {
    marginBottom: SPACING.md,
    gap: 6,
  },
  bulletItem: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: colors.text,
  },
  button: {
    marginTop: SPACING.xs,
  },
  secondaryButton: {
    marginTop: SPACING.sm,
  },
});
