import React, {useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';

export default function SignupScreen({navigation}){
  const [email,setEmail]=useState('');
  const [pw,setPw]=useState('');
  const [pw2,setPw2]=useState('');
  return (
    <ScrollView contentContainerStyle={[styles.form, common.screen]}>
      <Text style={styles.title}>Create Your Account</Text>
      <TextInput placeholder="Email or Phone Number" style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} value={pw} onChangeText={setPw} />
      <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input} value={pw2} onChangeText={setPw2} />
      <PrimaryButton title="Create Account" onPress={()=>navigation.navigate('BankConnect')} />
      <TouchableOpacity onPress={()=>navigation.replace('Main')}><Text style={[styles.smallText,{color:COLORS.textSecondary}]}>Already have an account? Log in</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form:{padding:SPACING.md},
  title:{fontSize:20,fontWeight:'700',marginBottom:SPACING.sm},
  input:{borderWidth:1,borderColor:COLORS.border,padding:SPACING.sm,borderRadius:8,marginBottom:SPACING.sm},
  primaryButton:{backgroundColor:COLORS.primary,padding:SPACING.sm,paddingHorizontal:SPACING.lg,borderRadius:8,marginTop:SPACING.md,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'},
  smallText:{marginTop:SPACING.sm,textAlign:'center'}
});
