import React, {useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Linking, View} from 'react-native';

import common, {SPACING} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';
import BrandLogo from '../components/BrandLogo';
import {BRANDING} from '../assets/branding';
import {useAppTheme} from '../theme/ThemeContext';

export default function SignupScreen({navigation}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const [mode, setMode] = useState('signup');
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

  function handleSignIn() {
    if (!email || !pw) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    navigation.replace('Main');
  }

  return (
    <ScrollView style={{backgroundColor: colors.background}} contentContainerStyle={[styles.form, common.screen, {backgroundColor: colors.background}]}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.signInTab}
          onPress={() => {
            setMode('signin');
            setError('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <Text style={styles.signInTabText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.heroWrap}>
        <BrandLogo
          size={77}
          imageSource={BRANDING.logoSource}
          imageUri={BRANDING.logoUri}
        />
        <Text style={[common.body, styles.heroMotto]}>Your finances. Handled.</Text>
      </View>

      <Text style={[common.title, common.titleBlock, styles.formTitle]}>{mode === 'signin' ? 'Sign In' : 'Create Your Account'}</Text>
      <TextInput placeholder="Email Address or Phone Number" placeholderTextColor={colors.textSecondary} style={styles.input} value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" placeholderTextColor={colors.textSecondary} secureTextEntry style={styles.input} value={pw} onChangeText={setPw} />
      {mode === 'signup' && <Text style={[common.caption, styles.requirementsText, styles.captionText]}>Use at least 8 characters including a number</Text>}
      {mode === 'signup' && (
        <TextInput placeholder="Confirm Password" placeholderTextColor={colors.textSecondary} secureTextEntry style={styles.input} value={pw2} onChangeText={setPw2} />
      )}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
      {mode === 'signup' && (
        <Text style={[common.caption, styles.termsText, styles.captionText]}>
          By creating an account you agree to our{' '}
          <Text style={styles.linkText} onPress={() => Linking.openURL('https://example.com/terms')}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.linkText} onPress={() => Linking.openURL('https://example.com/privacy')}>Privacy Policy</Text>
        </Text>
      )}
      <PrimaryButton title={mode === 'signin' ? 'Sign In' : 'Create Account'} onPress={mode === 'signin' ? handleSignIn : handleCreateAccount} style={styles.button} />
      {mode === 'signup' ? (
        <TouchableOpacity onPress={() => { setMode('signin'); setError(''); }}>
          <Text style={[common.caption, styles.smallText, styles.captionText]}>Already have an account? Log in</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => { setMode('signup'); setError(''); }}>
          <Text style={[common.caption, styles.smallText, styles.captionText]}>Need an account? Create one</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  form:{padding:SPACING.md},
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: SPACING.md,
  },
  signInTab: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  signInTabText: {
    color: colors.primary,
    fontFamily: 'Inter',
    fontWeight: '700',
    fontSize: 14,
  },
  heroWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  heroMotto: {
    marginTop: SPACING.sm,
    fontSize: 41,
    lineHeight: 46,
    color: colors.primary,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    minHeight: 54,
    backgroundColor: colors.white,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    color: colors.text,
  },
  formTitle: {color: colors.text},
  captionText: {color: colors.textSecondary},
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
    color: colors.accentBrown,
    fontWeight: '700',
    fontFamily: 'Inter',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: colors.error,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'Inter',
  }
});
