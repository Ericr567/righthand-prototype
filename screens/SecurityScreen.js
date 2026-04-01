import React, {useState} from 'react';
import {ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Switch} from 'react-native';
import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';
import {updatePassword} from '../services/supabase';

export default function SecurityScreen({navigation}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [twoFA,      setTwoFA]      = useState(false);
  const [biometric,  setBiometric]  = useState(false);
  const [pwSuccess,  setPwSuccess]  = useState(false);
  const [pwError,    setPwError]    = useState('');
  const [pwSaving,   setPwSaving]   = useState(false);

  async function handleChangePassword(){
    if (!currentPw) { setPwError('Please enter your current password.'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('New passwords do not match.'); return; }
    setPwError('');
    setPwSaving(true);
    try {
      await updatePassword(newPw);
      setPwSuccess(true);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setPwSaving(false);
    }
  }

  const pwStrength = newPw.length === 0 ? null
    : newPw.length < 8  ? 'weak'
    : newPw.length < 12 ? 'fair'
    : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) ? 'strong'
    : 'fair';

  const strengthColor = {weak:'#C62828', fair:'#F9A825', strong:colors.successText}[pwStrength] || colors.border;
  const strengthLabel = {weak:'Weak', fair:'Fair', strong:'Strong'}[pwStrength] || '';

  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Security &amp; Password</Text>

      {/* Change password */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Change Password</Text>

        {pwSuccess && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ Password updated successfully</Text>
          </View>
        )}
        {!!pwError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{pwError}</Text>
          </View>
        )}

        <Text style={styles.fieldLabel}>Current Password</Text>
        <View style={styles.pwRow}>
          <TextInput
            style={styles.pwInput}
            value={currentPw}
            onChangeText={setCurrentPw}
            secureTextEntry={!showPw}
            placeholder="••••••••"
            placeholderTextColor={colors.border}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setShowPw(p => !p)} style={styles.showBtn}>
            <Text style={styles.showBtnText}>{showPw ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.fieldLabel, {marginTop:SPACING.sm}]}>New Password</Text>
        <View style={styles.pwRow}>
          <TextInput
            style={styles.pwInput}
            value={newPw}
            onChangeText={setNewPw}
            secureTextEntry={!showPw}
            placeholder="Min. 8 characters"
            placeholderTextColor={colors.border}
            autoCapitalize="none"
          />
        </View>
        {/* Strength meter */}
        {pwStrength && (
          <View style={styles.strengthRow}>
            <View style={styles.strengthTrack}>
              <View style={[styles.strengthFill,
                {width: pwStrength === 'weak' ? '33%' : pwStrength === 'fair' ? '66%' : '100%',
                 backgroundColor: strengthColor}]}
              />
            </View>
            <Text style={[styles.strengthLabel, {color: strengthColor}]}>{strengthLabel}</Text>
          </View>
        )}

        <Text style={[styles.fieldLabel, {marginTop:SPACING.sm}]}>Confirm New Password</Text>
        <View style={styles.pwRow}>
          <TextInput
            style={styles.pwInput}
            value={confirmPw}
            onChangeText={setConfirmPw}
            secureTextEntry={!showPw}
            placeholder="Repeat new password"
            placeholderTextColor={colors.border}
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.requirements}>
          At least 8 characters · one uppercase letter · one number
        </Text>

        <TouchableOpacity style={[styles.saveBtn, pwSaving && {opacity: 0.6}]} onPress={handleChangePassword} disabled={pwSaving}>
          <Text style={styles.saveBtnText}>{pwSaving ? 'Updating...' : 'Update Password'}</Text>
        </TouchableOpacity>
      </View>

      {/* 2FA & biometric */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Authentication</Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Two-Factor Authentication</Text>
            <Text style={styles.toggleSub}>Require a code when signing in from a new device. (Coming soon)</Text>
          </View>
          <Switch
            value={twoFA}
            onValueChange={setTwoFA}
            trackColor={{false:colors.border, true:colors.primary}}
            thumbColor={colors.white}
          />
        </View>

        <View style={[styles.toggleRow, {borderTopWidth:1, borderTopColor:colors.border}]}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Biometric Login</Text>
            <Text style={styles.toggleSub}>Use Face ID or fingerprint to sign in quickly. (Coming soon)</Text>
          </View>
          <Switch
            value={biometric}
            onValueChange={setBiometric}
            trackColor={{false:colors.border, true:colors.primary}}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Active sessions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Sessions</Text>
        <View style={styles.sessionRow}>
          <View>
            <Text style={styles.sessionDevice}>This device · Web browser</Text>
            <Text style={styles.sessionMeta}>🟢 Active now · March 14, 2026</Text>
          </View>
          <View style={styles.currentPill}><Text style={styles.currentPillText}>Current</Text></View>
        </View>
        <TouchableOpacity style={styles.signOutAll}>
          <Text style={styles.signOutAllText}>Sign out of all other devices</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.text,marginBottom:SPACING.md},

  card:{
    backgroundColor:colors.white,borderRadius:16,padding:SPACING.md,
    borderWidth:1,borderColor:colors.border,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  cardTitle:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:colors.textSecondary,letterSpacing:1,textTransform:'uppercase',marginBottom:SPACING.md,
  },

  successBanner:{backgroundColor:colors.successBg,borderRadius:10,padding:SPACING.sm,marginBottom:SPACING.sm,borderWidth:1,borderColor:colors.successBorder},
  successText:{fontSize:13,fontFamily:'Inter',color:colors.successText,fontWeight:'600'},
  errorBanner:{backgroundColor:colors.dangerBg,borderRadius:10,padding:SPACING.sm,marginBottom:SPACING.sm,borderWidth:1,borderColor:colors.dangerBorder},
  errorText:{fontSize:13,fontFamily:'Inter',color:colors.dangerText},

  fieldLabel:{fontSize:11,fontWeight:'700',fontFamily:'Inter',color:colors.textSecondary,marginBottom:4,letterSpacing:0.5},
  pwRow:{
    flexDirection:'row',alignItems:'center',
    borderWidth:1,borderColor:colors.border,borderRadius:10,
    backgroundColor:colors.background,paddingHorizontal:SPACING.sm,
  },
  pwInput:{flex:1,fontSize:15,fontFamily:'Inter',color:colors.text,paddingVertical:10,outlineStyle:'none'},
  showBtn:{paddingLeft:SPACING.sm},
  showBtnText:{fontSize:13,fontWeight:'600',fontFamily:'Inter',color:colors.primary},

  strengthRow:{flexDirection:'row',alignItems:'center',marginTop:6,gap:8},
  strengthTrack:{flex:1,height:4,backgroundColor:colors.border,borderRadius:4,overflow:'hidden'},
  strengthFill:{height:4,borderRadius:4},
  strengthLabel:{fontSize:11,fontWeight:'700',fontFamily:'Inter'},

  requirements:{fontSize:11,fontFamily:'Inter',color:colors.textSecondary,marginTop:6,lineHeight:16},

  saveBtn:{
    backgroundColor:colors.primary,borderRadius:12,
    padding:SPACING.md,alignItems:'center',marginTop:SPACING.md,
  },
  saveBtnText:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:colors.onPrimary},

  toggleRow:{paddingVertical:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  toggleInfo:{flex:1,paddingRight:SPACING.md},
  toggleLabel:{fontSize:15,fontWeight:'500',fontFamily:'Inter',color:colors.text},
  toggleSub:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},

  sessionRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:SPACING.sm},
  sessionDevice:{fontSize:14,fontWeight:'500',fontFamily:'Inter',color:colors.text},
  sessionMeta:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},
  currentPill:{backgroundColor:colors.successBg,borderRadius:20,paddingHorizontal:10,paddingVertical:3,borderWidth:1,borderColor:colors.successBorder},
  currentPillText:{fontSize:11,fontWeight:'700',fontFamily:'Inter',color:colors.successText},
  signOutAll:{marginTop:SPACING.sm,borderTopWidth:1,borderTopColor:colors.border,paddingTop:SPACING.sm},
  signOutAllText:{fontSize:13,fontWeight:'600',fontFamily:'Inter',color:colors.dangerText},
});
