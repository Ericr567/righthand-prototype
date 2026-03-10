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
      <Text style={[common.title, common.titleBlock]}>Create Your Account</Text>
      <TextInput placeholder="Email or Phone Number" style={common.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={common.input} value={pw} onChangeText={setPw} />
      <TextInput placeholder="Confirm Password" secureTextEntry style={common.input} value={pw2} onChangeText={setPw2} />
      <PrimaryButton title="Create Account" onPress={()=>navigation.navigate('BankConnect')} style={styles.button} />
      <TouchableOpacity onPress={()=>navigation.replace('Main')}><Text style={[common.caption, styles.smallText]}>Already have an account? Log in</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form:{padding:SPACING.md},
  button:{marginTop:SPACING.xs},
  smallText:{marginTop:SPACING.md,textAlign:'center'}
});
