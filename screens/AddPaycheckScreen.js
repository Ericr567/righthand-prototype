import React, {useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

export default function AddPaycheckScreen({navigation}){
  const [freq,setFreq]=useState('Bi-weekly');
  const [nextDate,setNextDate]=useState('2026-03-01');
  const [amt,setAmt]=useState('');
  return (
    <ScrollView contentContainerStyle={[styles.form, common.screen]}>
      <Text style={styles.title}>Your Pay Schedule</Text>
      <TextInput placeholder="How often are you paid?" style={styles.input} value={freq} onChangeText={setFreq} />
      <TextInput placeholder="Next Paycheck Date" style={styles.input} value={nextDate} onChangeText={setNextDate} />
      <TextInput placeholder="Usual Deposit Amount (Optional)" style={styles.input} value={amt} onChangeText={setAmt} />
      <PrimaryButton title="Save Schedule" onPress={()=>navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form:{padding:SPACING.md},
  title:{fontSize:20,fontWeight:'700',marginBottom:SPACING.sm},
  input:{borderWidth:1,borderColor:COLORS.border,padding:SPACING.sm,borderRadius:8,marginBottom:SPACING.sm},
  primaryButton:{backgroundColor:COLORS.primary,padding:SPACING.sm,paddingHorizontal:SPACING.lg,borderRadius:8,marginTop:SPACING.md,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'}
});
