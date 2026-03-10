import React from 'react';
import {ScrollView, Text, TouchableOpacity, StyleSheet} from 'react-native';
import common, {SPACING, COLORS} from '../styles/common';
export default function SettingsScreen({navigation}){
  return (
    <ScrollView style={common.screen}>
      <Text style={[common.title, common.titleBlock]}>Settings</Text>

      <TouchableOpacity style={styles.item} onPress={() => {}}><Text style={common.body}>Profile</Text></TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => {}}><Text style={common.body}>Bank Accounts</Text></TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AddPaycheck')}><Text style={common.body}>Pay Schedule</Text></TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Notifications')}><Text style={common.body}>Notifications</Text></TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => {}}><Text style={common.body}>Security & Password</Text></TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Help')}><Text style={common.body}>Support</Text></TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => {}}><Text style={common.body}>Legal & Privacy</Text></TouchableOpacity>

      <TouchableOpacity style={styles.logout} onPress={()=>navigation.replace('Welcome')}><Text style={styles.logoutText}>Log Out</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  item:{paddingVertical:SPACING.sm,borderBottomWidth:1,borderBottomColor:COLORS.border},
  logout:{marginTop:SPACING.md,backgroundColor:COLORS.dangerBg,borderWidth:1,borderColor:COLORS.dangerBorder,padding:SPACING.sm,borderRadius:8,alignItems:'center'},
  logoutText:{color:COLORS.dangerText,fontWeight:'700'}
});
