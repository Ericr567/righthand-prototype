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
      <View style={styles.logoWrap}>
        <BrandLogo
          size={52}
          imageSource={BRANDING.logoSource}
          imageUri={BRANDING.logoUri}
        />
      </View>
      <Text style={[common.display, styles.headline]}>Welcome to RightHand</Text>
      <Text style={[common.body, styles.tag]}>Your finances. Handled.</Text>
      <PrimaryButton title="Get Started" onPress={()=>navigation.navigate('Signup')} style={styles.button} />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  screen: {alignItems: 'center', justifyContent: 'flex-start'},
  logoWrap:{marginTop:72, marginBottom:SPACING.xl},
  headline:{textAlign:'center', color: colors.text},
  tag:{marginTop:SPACING.sm, marginBottom:SPACING.lg, color:colors.primary},
  button:{marginTop:SPACING.md,minWidth:240},
});
