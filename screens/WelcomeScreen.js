import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';

export default function WelcomeScreen({navigation}){
  return (
    <View style={[styles.centered, common.screen]}>
      <View style={styles.logoWrap}>
        <Text style={common.display}>RightHand Logo</Text>
      </View>
      <Text style={[common.caption, styles.tag]}>Your money’s right hand.</Text>
      <PrimaryButton title="Get Started" onPress={()=>navigation.navigate('Signup')} style={styles.button} />
      <TouchableOpacity style={styles.ghostButton} onPress={()=>navigation.replace('Main')}>
        <Text style={[styles.link,{color:COLORS.primary}]}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered:{flex:1,justifyContent:'center',alignItems:'center',padding:SPACING.lg},
  logoWrap:{paddingVertical:SPACING.md,paddingHorizontal:SPACING.lg,borderWidth:1,borderColor:COLORS.border,borderRadius:10,marginBottom:SPACING.sm},
  tag:{marginTop:SPACING.xs, marginBottom:SPACING.sm},
  button:{marginTop:SPACING.md,minWidth:220},
  primaryButton:{padding:SPACING.sm,paddingHorizontal:SPACING.lg,borderRadius:8,marginTop:SPACING.md},
  ghostButton:{marginTop:SPACING.sm,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'},
  link:{}
});
