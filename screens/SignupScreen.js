import React, {useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Linking} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';

export default function SignupScreen({navigation}){
  const [email,setEmail]=useState('');
  const [pw,setPw]=useState('');
  const [pw2,setPw2]=useState('');
  const [error, setError] = useState('');

  function handleCreateAccount() {
    if (!email || !pw || !pw2) {
      setError('Please fill out all fields.');
      return;
    }
    if (pw !== pw2) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    navigation.navigate('BankConnect');
  }

  return (
    <ScrollView contentContainerStyle={[styles.form, common.screen]}>
      <Text style={[common.title, common.titleBlock]}>Create Your Account</Text>
      <TextInput placeholder="Email Address or Phone Number" placeholderTextColor={COLORS.textSecondary} style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" placeholderTextColor={COLORS.textSecondary} secureTextEntry style={styles.input} value={pw} onChangeText={setPw} />
      <Text style={[common.caption, styles.requirementsText]}>Use at least 8 characters including a number</Text>
      <TextInput placeholder="Confirm Password" placeholderTextColor={COLORS.textSecondary} secureTextEntry style={styles.input} value={pw2} onChangeText={setPw2} />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      <Text style={[common.caption, styles.termsText]}>
        By creating an account you agree to our{' '}
        <Text style={styles.linkText} onPress={() => Linking.openURL('https://example.com/terms')}>Terms of Service</Text>
        {' '}and{' '}
        <Text style={styles.linkText} onPress={() => Linking.openURL('https://example.com/privacy')}>Privacy Policy</Text>
      </Text>
      <PrimaryButton title="Create Account" onPress={handleCreateAccount} style={styles.button} />
      <TouchableOpacity onPress={()=>navigation.replace('Main')}><Text style={[common.caption, styles.smallText]}>Already have an account? Log in</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form:{padding:SPACING.md},
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    minHeight: 54,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.text,
  },
  button:{marginTop:SPACING.xs},
  smallText:{marginTop:SPACING.md,textAlign:'center'},
  requirementsText: {
    marginTop: -SPACING.xs,
    marginBottom: SPACING.sm,
  },
  termsText: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    lineHeight: 18,
  },
  linkText: {
    color: COLORS.accentBrown,
    fontWeight: '700',
    fontFamily: 'Inter',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter',
  }
});
