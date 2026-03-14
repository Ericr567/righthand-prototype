import React, {useState} from 'react';
import {ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import common, {SPACING, COLORS} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';

export default function ProfileScreen({navigation}){
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [phone,     setPhone]     = useState('');
  const [editing,   setEditing]   = useState(false);

  function handleSave(){
    setEditing(false);
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
              ? <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First" placeholderTextColor={COLORS.border} />
              : <Text style={styles.fieldValue}>{firstName || '—'}</Text>
            }
          </View>
          <View style={[styles.fieldHalf, {marginLeft:SPACING.sm}]}>
            <Text style={styles.fieldLabel}>Last Name</Text>
            {editing
              ? <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last" placeholderTextColor={COLORS.border} />
              : <Text style={styles.fieldValue}>{lastName || '—'}</Text>
            }
          </View>
        </View>

        <Text style={[styles.fieldLabel, {marginTop:SPACING.sm}]}>Email Address</Text>
        {editing
          ? <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={COLORS.border} keyboardType="email-address" autoCapitalize="none" />
          : <Text style={styles.fieldValue}>{email || '—'}</Text>
        }

        <Text style={[styles.fieldLabel, {marginTop:SPACING.sm}]}>Phone Number</Text>
        {editing
          ? <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(555) 000-0000" placeholderTextColor={COLORS.border} keyboardType="phone-pad" />
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
        <TouchableOpacity style={styles.dangerBtn}>
          <Text style={styles.dangerBtnText}>Delete Account</Text>
        </TouchableOpacity>
        <Text style={styles.dangerHint}>This will permanently remove your account and all data. This action cannot be undone.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:COLORS.text,marginBottom:SPACING.md},

  avatarWrap:{alignItems:'center',marginBottom:SPACING.lg},
  avatar:{
    width:80,height:80,borderRadius:40,
    backgroundColor:COLORS.primary,
    alignItems:'center',justifyContent:'center',
    marginBottom:SPACING.sm,
    shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.15,shadowRadius:8,elevation:4,
  },
  avatarInitials:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:'#fff'},
  avatarName:{fontSize:18,fontWeight:'700',fontFamily:'Inter',color:COLORS.text},
  avatarEmail:{fontSize:13,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2},

  formCard:{
    backgroundColor:COLORS.white,borderRadius:16,padding:SPACING.md,
    borderWidth:1,borderColor:COLORS.border,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  cardHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:SPACING.md},
  cardTitle:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:COLORS.textSecondary,letterSpacing:1,textTransform:'uppercase',
  },
  editToggle:{fontSize:14,fontWeight:'600',fontFamily:'Inter',color:COLORS.primary},

  fieldRow:{flexDirection:'row',marginBottom:SPACING.xs},
  fieldHalf:{flex:1},
  fieldLabel:{fontSize:11,fontWeight:'700',fontFamily:'Inter',color:COLORS.textSecondary,marginBottom:4,letterSpacing:0.5},
  fieldValue:{fontSize:15,fontFamily:'Inter',color:COLORS.text,paddingVertical:8},
  input:{
    borderWidth:1,borderColor:COLORS.border,borderRadius:10,
    padding:SPACING.sm,fontFamily:'Inter',fontSize:15,color:COLORS.text,
    backgroundColor:COLORS.background,outlineStyle:'none',
  },
  saveBtn:{
    backgroundColor:COLORS.primary,borderRadius:12,
    padding:SPACING.md,alignItems:'center',marginTop:SPACING.md,
  },
  saveBtnText:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:'#fff'},

  infoRow:{
    flexDirection:'row',justifyContent:'space-between',alignItems:'center',
    paddingVertical:12,borderBottomWidth:1,borderBottomColor:COLORS.border,
  },
  infoLabel:{fontSize:14,fontFamily:'Inter',color:COLORS.textSecondary},
  infoValue:{fontSize:14,fontWeight:'500',fontFamily:'Inter',color:COLORS.text},
  activePill:{backgroundColor:COLORS.successBg,borderRadius:20,paddingHorizontal:10,paddingVertical:3,borderWidth:1,borderColor:COLORS.successBorder},
  activePillText:{fontSize:12,fontWeight:'700',fontFamily:'Inter',color:COLORS.successText},

  dangerCard:{
    backgroundColor:COLORS.dangerBg,borderRadius:16,padding:SPACING.md,
    borderWidth:1,borderColor:COLORS.dangerBorder,marginBottom:SPACING.md,
  },
  dangerTitle:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:COLORS.dangerText,letterSpacing:1,textTransform:'uppercase',marginBottom:SPACING.sm,
  },
  dangerBtn:{
    borderWidth:1,borderColor:COLORS.dangerBorder,borderRadius:10,
    padding:SPACING.sm,alignItems:'center',marginBottom:SPACING.xs,
  },
  dangerBtnText:{fontSize:14,fontWeight:'700',fontFamily:'Inter',color:COLORS.dangerText},
  dangerHint:{fontSize:11,fontFamily:'Inter',color:COLORS.dangerText,opacity:0.7,lineHeight:16},
});
