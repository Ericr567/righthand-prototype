import React from 'react';
import {ScrollView, Text, TouchableOpacity, StyleSheet, View, Switch} from 'react-native';
import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';

function SettingsRow({label, subtitle, onPress, arrow=true, rightAccessory, styles}){
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowInner}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      {rightAccessory || (arrow && <Text style={styles.rowArrow}>›</Text>)}
    </TouchableOpacity>
  );
}

function SectionCard({title, children, styles}){
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionHeader}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen({navigation, themeMode = 'light', onThemeModeChange}){
  const {colors, isDark} = useAppTheme();
  const styles = createStyles(colors);

  return (
    <ScrollView style={[common.screen, {backgroundColor: colors.background}]} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Settings</Text>

      <SectionCard title="Account" styles={styles}>
        <SettingsRow label="Profile" onPress={() => navigation.navigate('Profile')} styles={styles} />
        <SettingsRow label="Bank Accounts" onPress={() => {}} styles={styles} />
        <SettingsRow label="Security & Password" onPress={() => navigation.navigate('Security')} styles={styles} />
      </SectionCard>

      <SectionCard title="Money & Savings" styles={styles}>
        <SettingsRow
          label="Auto Save"
          subtitle="Set up automatic savings on each paycheck."
          onPress={() => navigation.navigate('AutoSave')}
          styles={styles}
        />
        <SettingsRow
          label="Pay Schedule"
          subtitle="Helps RightHand plan savings around your paychecks."
          onPress={() => navigation.navigate('AddPaycheck')}
          styles={styles}
        />
      </SectionCard>

      <SectionCard title="Preferences" styles={styles}>
        <SettingsRow label="Notifications" onPress={() => navigation.navigate('Notifications')} styles={styles} />
        <SettingsRow
          label="Dark Mode"
          subtitle="Switch between light and dark appearance."
          onPress={() => onThemeModeChange && onThemeModeChange(isDark ? 'light' : 'dark')}
          arrow={false}
          styles={styles}
          rightAccessory={
            <Switch
              value={themeMode === 'dark'}
              onValueChange={(v) => onThemeModeChange && onThemeModeChange(v ? 'dark' : 'light')}
              trackColor={{false: colors.border, true: colors.primary}}
              thumbColor={colors.white}
            />
          }
        />
        <SettingsRow label="Legal & Privacy" onPress={() => {}} styles={styles} />
      </SectionCard>

      <SectionCard title="Support" styles={styles}>
        <SettingsRow label="Help Center" onPress={() => navigation.navigate('Help')} styles={styles} />
        <SettingsRow label="Contact Us" onPress={() => {}} styles={styles} />
      </SectionCard>

      <TouchableOpacity style={styles.logout} onPress={() => navigation.replace('Welcome')}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.text,marginBottom:SPACING.md},

  sectionCard:{
    backgroundColor:colors.white,
    borderRadius:16,
    borderWidth:1,
    borderColor:colors.border,
    marginBottom:SPACING.md,
    overflow:'hidden',
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  sectionHeader:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:colors.textSecondary,letterSpacing:1,textTransform:'uppercase',
    paddingHorizontal:SPACING.md,paddingTop:SPACING.sm,paddingBottom:4,
  },

  row:{
    flexDirection:'row',alignItems:'center',justifyContent:'space-between',
    paddingHorizontal:SPACING.md,paddingVertical:14,
    borderTopWidth:1,borderTopColor:colors.border,
  },
  rowInner:{flex:1,paddingRight:SPACING.sm},
  rowLabel:{fontSize:15,fontWeight:'500',fontFamily:'Inter',color:colors.text},
  rowSub:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},
  rowArrow:{fontSize:22,color:colors.border,fontWeight:'300'},

  logout:{
    marginTop:SPACING.sm,
    backgroundColor:colors.dangerBg,
    borderWidth:1,borderColor:colors.dangerBorder,
    padding:SPACING.md,borderRadius:14,alignItems:'center',
  },
  logoutText:{color:colors.dangerText,fontWeight:'700',fontFamily:'Inter',fontSize:15},
});

