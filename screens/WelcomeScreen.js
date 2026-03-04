import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';

export default function WelcomeScreen({navigation}){
  return (
    <View style={[styles.centered, common.screen]}>
      <Text style={[styles.logo, {color:COLORS.text}]}>RightHand</Text>
      <Text style={[styles.tag, {marginTop:SPACING.xs, color:COLORS.textSecondary}]}>Your money’s right hand.</Text>
      <PrimaryButton title="Get Started" onPress={()=>navigation.navigate('Signup')} />
      <TouchableOpacity style={styles.ghostButton} onPress={()=>navigation.replace('Main')}><Text style={[styles.link,{color:COLORS.primary}]}>Log In</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered:{flex:1,justifyContent:'center',alignItems:'center',padding:SPACING.lg},
  logo:{fontSize:36,fontWeight:'800'},
  tag:{marginTop:SPACING.xs},
  primaryButton:{padding:SPACING.sm,paddingHorizontal:SPACING.lg,borderRadius:8,marginTop:SPACING.md},
  ghostButton:{marginTop:SPACING.sm,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'},
  link:{}
});
