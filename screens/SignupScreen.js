import React, {useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, Linking, View} from 'react-native';

import common, {SPACING} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';
import BrandLogo from '../components/BrandLogo';
import {BRANDING} from '../assets/branding';
import {useAppTheme} from '../theme/ThemeContext';

export default function SignupScreen({navigation, onSignUp, onSignIn, hasSupabase = false, authError = ''}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const [mode, setMode] = useState('signup');
  const [email,setEmail]=useState('');
  const [pw,setPw]=useState('');
  const [pw2,setPw2]=useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateAccount() {
    if (!email || !pw || !pw2) {
      setError('Please fill out all fields.');
      return;
    }
    if (pw !== pw2) {
      setError('Passwords do not match.');
      return;
    }

    if (!hasSupabase) {
      setError('Auth is not configured yet. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    setSubmitting(true);
    setError('');
    const result = await onSignUp?.(email.trim(), pw);
    setSubmitting(false);
    if (!result?.ok) {
      setError(result?.error || authError || 'Unable to create account.');
      return;
    }

    navigation.navigate('BankConnect');
  }

  async function handleSignIn() {
    if (!email || !pw) {
      setError('Please enter your email and password.');
      return;
    }

    if (!hasSupabase) {
      setError('Auth is not configured yet. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
      return;
    }

    setSubmitting(true);
    setError('');
    const result = await onSignIn?.(email.trim(), pw);
    setSubmitting(false);
    if (!result?.ok) {
      setError(result?.error || authError || 'Unable to sign in.');
      return;
    }

    navigation.replace('Main');
  }

  return (
    <ScrollView
      style={{backgroundColor: colors.background}}
      contentContainerStyle={[styles.form, common.screen, {backgroundColor: colors.background}]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroWrap}>
        <BrandLogo
          size={64}
          imageSource={BRANDING.logoSource}
          imageUri={BRANDING.logoUri}
        />
        <Text style={styles.heroMotto}>Welcome to RightHand</Text>
        <Text style={styles.heroSub}>Set up your account to start tracking bills and automating savings.</Text>
      </View>

      <View style={styles.modeSwitch}>
        <TouchableOpacity
          style={[styles.modePill, mode === 'signup' && styles.modePillActive]}
          onPress={() => {
            setMode('signup');
            setError('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Create account mode"
        >
          <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modePill, mode === 'signin' && styles.modePillActive]}
          onPress={() => {
            setMode('signin');
            setError('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign in mode"
        >
          <Text style={[styles.modeText, mode === 'signin' && styles.modeTextActive]}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formCard}>
        <Text style={[common.title, styles.formTitle]}>{mode === 'signin' ? 'Sign in to your account' : 'Create your account'}</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="name@example.com"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          style={styles.input}
          value={pw}
          onChangeText={setPw}
        />

        {mode === 'signup' && (
          <>
            <Text style={styles.requirementsText}>Use at least 8 characters including a number.</Text>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              placeholder="Confirm password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              style={styles.input}
              value={pw2}
              onChangeText={setPw2}
            />
          </>
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {mode === 'signup' && (
          <Text style={[common.caption, styles.termsText, styles.captionText]}>
            By creating an account you agree to our{' '}
            <Text style={styles.linkText} onPress={() => Linking.openURL('mailto:support@righthand.app?subject=Terms')}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText} onPress={() => Linking.openURL('mailto:support@righthand.app?subject=Privacy')}>Privacy Policy</Text>
          </Text>
        )}

        <PrimaryButton
          title={mode === 'signin' ? 'Sign In' : 'Create Account'}
          onPress={mode === 'signin' ? handleSignIn : handleCreateAccount}
          style={styles.button}
          disabled={submitting}
          loading={submitting}
        />
      </View>

      <TouchableOpacity
        onPress={() => {
          setMode(mode === 'signup' ? 'signin' : 'signup');
          setError('');
        }}
      >
        <Text style={[common.caption, styles.smallText, styles.captionText]}>
          {mode === 'signup' ? 'Already have an account? Sign in' : 'Need an account? Create one'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  form:{padding:SPACING.md},
  heroWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  heroMotto: {
    marginTop: SPACING.sm,
    fontSize: 28,
    lineHeight: 34,
    color: colors.primary,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontWeight: '800',
  },
  heroSub: {
    marginTop: SPACING.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 14,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.subtleBg,
    borderRadius: 14,
    padding: 4,
    marginBottom: SPACING.md,
  },
  modePill: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modePillActive: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeText: {
    color: colors.textSecondary,
    fontFamily: 'Inter',
    fontWeight: '700',
  },
  modeTextActive: {
    color: colors.text,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: SPACING.md,
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
  label: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textSecondary,
    fontFamily: 'Inter',
    fontWeight: '700',
    marginBottom: 6,
  },
  formTitle: {color: colors.text},
  captionText: {color: colors.textSecondary},
  button:{marginTop:SPACING.sm},
  smallText:{marginTop:SPACING.md,textAlign:'center'},
  requirementsText: {
    marginTop: -2,
    marginBottom: SPACING.sm,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter',
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
