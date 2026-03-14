import React from 'react';
import {ScrollView, Text, TouchableOpacity, StyleSheet, View} from 'react-native';
import common, {SPACING, COLORS} from '../styles/common';

function SettingsRow({label, subtitle, onPress, arrow=true}){
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowInner}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {arrow && <Text style={styles.rowArrow}>›</Text>}
    </TouchableOpacity>
  );
}

function SectionCard({title, children}){
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionHeader}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen({navigation}){
  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Settings</Text>

      <SectionCard title="Account">
        <SettingsRow label="Profile" onPress={() => navigation.navigate('Profile')} />
        <SettingsRow label="Bank Accounts" onPress={() => {}} />
        <SettingsRow label="Security & Password" onPress={() => navigation.navigate('Security')} />
      </SectionCard>

      <SectionCard title="Money & Savings">
        <SettingsRow
          label="Auto Save"
          subtitle="Set up automatic savings on each paycheck."
          onPress={() => navigation.navigate('AutoSave')}
        />
        <SettingsRow
          label="Pay Schedule"
          subtitle="Helps RightHand plan savings around your paychecks."
          onPress={() => navigation.navigate('AddPaycheck')}
        />
      </SectionCard>

      <SectionCard title="Preferences">
        <SettingsRow label="Notifications" onPress={() => navigation.navigate('Notifications')} />
        <SettingsRow label="Legal & Privacy" onPress={() => {}} />
      </SectionCard>

      <SectionCard title="Support">
        <SettingsRow label="Help Center" onPress={() => navigation.navigate('Help')} />
        <SettingsRow label="Contact Us" onPress={() => {}} />
      </SectionCard>

      <TouchableOpacity style={styles.logout} onPress={() => navigation.replace('Welcome')}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:COLORS.text,marginBottom:SPACING.md},

  sectionCard:{
    backgroundColor:COLORS.white,
    borderRadius:16,
    borderWidth:1,
    borderColor:COLORS.border,
    marginBottom:SPACING.md,
    overflow:'hidden',
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  sectionHeader:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:COLORS.textSecondary,letterSpacing:1,textTransform:'uppercase',
    paddingHorizontal:SPACING.md,paddingTop:SPACING.sm,paddingBottom:4,
  },

  row:{
    flexDirection:'row',alignItems:'center',justifyContent:'space-between',
    paddingHorizontal:SPACING.md,paddingVertical:14,
    borderTopWidth:1,borderTopColor:COLORS.border,
  },
  rowInner:{flex:1,paddingRight:SPACING.sm},
  rowLabel:{fontSize:15,fontWeight:'500',fontFamily:'Inter',color:COLORS.text},
  rowSub:{fontSize:12,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2},
  rowArrow:{fontSize:22,color:COLORS.border,fontWeight:'300'},

  logout:{
    marginTop:SPACING.sm,
    backgroundColor:COLORS.dangerBg,
    borderWidth:1,borderColor:COLORS.dangerBorder,
    padding:SPACING.md,borderRadius:14,alignItems:'center',
  },
  logoutText:{color:COLORS.dangerText,fontWeight:'700',fontFamily:'Inter',fontSize:15},
});

