import React from 'react';
import {ScrollView, Text, TouchableOpacity, StyleSheet} from 'react-native';
import common from '../styles/common';
export default function SettingsScreen({navigation}){
  return (
    <ScrollView style={common.screen}>
      <Text style={common.title}>Settings</Text>
      <TouchableOpacity onPress={() => { /* placeholder */ }}><Text style={{marginTop:8}}>Profile</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => { /* placeholder */ }}><Text>Bank Accounts</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('AddPaycheck')}><Text>Pay Schedule</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')}><Text>Notifications</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => { /* placeholder */ }}><Text>Security & Password</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Help')}><Text>Support</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => { /* placeholder */ }}><Text>Legal & Privacy</Text></TouchableOpacity>
      <TouchableOpacity style={styles.logout} onPress={()=>navigation.replace('Welcome')}><Text style={{color:'red'}}>Log Out</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logout:{marginTop:12}
});
