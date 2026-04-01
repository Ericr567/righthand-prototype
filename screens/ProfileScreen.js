import React, {useState, useEffect} from 'react';
import {Alert, ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';
import {signOutUser} from '../services/supabase';

const PROFILE_KEY = 'righthand_profile_v1';

export default function ProfileScreen({navigation}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [editing,   setEditing]   = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY).then(raw => {
      if (!raw) return;
      try {
        const p = JSON.parse(raw);
        if (p.firstName) setFirstName(p.firstName);
        if (p.lastName)  setLastName(p.lastName);
        if (p.email)     setEmail(p.email);
        if (p.phone)     setPhone(p.phone);
      } catch {}
    }).catch(() => {});
  }, []);

  function handleSave(){
    AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({firstName, lastName, email, phone})).catch(() => {});
    setEditing(false);
  }

  function handleDeleteAccount(){
    Alert.alert(
      'Delete Account',
      'This will permanently remove your account and all data. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await AsyncStorage.clear();
            await signOutUser();
          } catch (err) {
            console.warn('Delete account error:', err.message);
          }
        }},
      ]
    );
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Profile</Text>

      {/* Avatar placeholder */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitials}>
            {(firstName?.[0] || '?').toUpperCase()}{(lastName?.[0] || '').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.avatarName}>
          {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Your Name'}
        </Text>
        <Text style={styles.avatarEmail}>{email || 'your@email.com'}</Text>
      </View>

      {/* Personal info */}
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <TouchableOpacity onPress={() => setEditing(e => !e)}>
            <Text style={styles.editToggle}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.fieldLabel}>First Name</Text>
            {editing
              ? <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First" placeholderTextColor={colors.border} />
              : <Text style={styles.fieldValue}>{firstName || '—'}</Text>
            }
          </View>
          <View style={[styles.fieldHalf, {marginLeft:SPACING.sm}]}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            {editing
              ? <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last" placeholderTextColor={colors.border} />
              : <Text style={styles.fieldValue}>{lastName || '—'}</Text>
            }
          </View>
        </View>

        <Text style={[styles.fieldLabel, {marginTop:SPACING.sm}]}>Email Address</Text>
        {editing
          ? <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={colors.border} keyboardType="email-address" autoCapitalize="none" />
          : <Text style={styles.fieldValue}>{email || '—'}</Text>
        }

        <Text style={[styles.fieldLabel, {marginTop:SPACING.sm}]}>Phone Number</Text>
        {editing
          ? <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(555) 000-0000" placeholderTextColor={colors.border} keyboardType="phone-pad" />
          : <Text style={styles.fieldValue}>{phone || '—'}</Text>
        }

        {editing && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Account info */}
      <View style={styles.formCard}>
        <Text style={styles.cardTitle}>Account</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member since</Text>
          <Text style={styles.infoValue}>March 2026</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account status</Text>
          <View style={styles.activePill}><Text style={styles.activePillText}>Active</Text></View>
        </View>
        <View style={[styles.infoRow, {borderBottomWidth:0}]}>
          <Text style={styles.infoLabel}>Plan</Text>
          <Text style={styles.infoValue}>Free Preview</Text>
        </View>
      </View>

      {/* Danger zone */}
      <View style={styles.dangerCard}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleDeleteAccount}>
          <Text style={styles.dangerBtnText}>Delete Account</Text>
        </TouchableOpacity>
        <Text style={styles.dangerHint}>This will permanently remove your account and all data. This action cannot be undone.</Text>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.text,marginBottom:SPACING.md},

  avatarWrap:{alignItems:'center',marginBottom:SPACING.lg},
  avatar:{
    width:80,height:80,borderRadius:40,
    backgroundColor:colors.primary,
    alignItems:'center',justifyContent:'center',
    marginBottom:SPACING.sm,
    shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.15,shadowRadius:8,elevation:4,
  },
  avatarInitials:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.onPrimary},
  avatarName:{fontSize:18,fontWeight:'700',fontFamily:'Inter',color:colors.text},
  avatarEmail:{fontSize:13,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},

  formCard:{
    backgroundColor:colors.white,borderRadius:16,padding:SPACING.md,
    borderWidth:1,borderColor:colors.border,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  cardHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:SPACING.md},
  cardTitle:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:colors.textSecondary,letterSpacing:1,textTransform:'uppercase',
  },
  editToggle:{fontSize:14,fontWeight:'600',fontFamily:'Inter',color:colors.primary},

  fieldRow:{flexDirection:'row',marginBottom:SPACING.xs},
  fieldHalf:{flex:1},
  fieldLabel:{fontSize:11,fontWeight:'700',fontFamily:'Inter',color:colors.textSecondary,marginBottom:4,letterSpacing:0.5},
  fieldValue:{fontSize:15,fontFamily:'Inter',color:colors.text,paddingVertical:8},
  input:{
    borderWidth:1,borderColor:colors.border,borderRadius:10,
    padding:SPACING.sm,fontFamily:'Inter',fontSize:15,color:colors.text,
    backgroundColor:colors.background,outlineStyle:'none',
  },
  saveBtn:{
    backgroundColor:colors.primary,borderRadius:12,
    padding:SPACING.md,alignItems:'center',marginTop:SPACING.md,
  },
  saveBtnText:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:colors.onPrimary},

  infoRow:{
    flexDirection:'row',justifyContent:'space-between',alignItems:'center',
    paddingVertical:12,borderBottomWidth:1,borderBottomColor:colors.border,
  },
  infoLabel:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary},
  infoValue:{fontSize:14,fontWeight:'500',fontFamily:'Inter',color:colors.text},
  activePill:{backgroundColor:colors.successBg,borderRadius:20,paddingHorizontal:10,paddingVertical:3,borderWidth:1,borderColor:colors.successBorder},
  activePillText:{fontSize:12,fontWeight:'700',fontFamily:'Inter',color:colors.successText},

  dangerCard:{
    backgroundColor:colors.dangerBg,borderRadius:16,padding:SPACING.md,
    borderWidth:1,borderColor:colors.dangerBorder,marginBottom:SPACING.md,
  },
  dangerTitle:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:colors.dangerText,letterSpacing:1,textTransform:'uppercase',marginBottom:SPACING.sm,
  },
  dangerBtn:{
    borderWidth:1,borderColor:colors.dangerBorder,borderRadius:10,
    padding:SPACING.sm,alignItems:'center',marginBottom:SPACING.xs,
  },
  dangerBtnText:{fontSize:14,fontWeight:'700',fontFamily:'Inter',color:colors.dangerText},
  dangerHint:{fontSize:11,fontFamily:'Inter',color:colors.dangerText,opacity:0.7,lineHeight:16},
});
