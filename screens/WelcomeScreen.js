import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';
import BrandLogo from '../components/BrandLogo';
import {BRANDING} from '../assets/branding';

export default function WelcomeScreen({navigation}){
  return (
    <View style={[common.screen, styles.screen]}>
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

const styles = StyleSheet.create({
  screen: {alignItems: 'center', justifyContent: 'flex-start'},
  logoWrap:{marginTop:72, marginBottom:SPACING.xl},
  headline:{textAlign:'center'},
  tag:{marginTop:SPACING.sm, marginBottom:SPACING.lg, color:COLORS.primary},
  button:{marginTop:SPACING.md,minWidth:240},
});
