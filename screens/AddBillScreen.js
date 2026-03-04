import React, {useState, useEffect} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

export default function AddBillScreen({navigation, route, onSave}){
  const existing = route.params?.bill;
  const [name,setName]=useState('');
  const [amount,setAmount]=useState('');
  const [due,setDue]=useState('15');
  const [frequency,setFrequency]=useState('Monthly');
  const [company,setCompany]=useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name || '');
      setAmount(String(existing.amount || ''));
      setDue(String(existing.due || '15'));
      setFrequency(existing.frequency || 'Monthly');
      setCompany(existing.company || '');
    }
  }, [existing]);

  function handleSave(){
    const billData = {
      id: existing ? existing.id : Date.now(),
      name,
      amount: Number(amount || 0),
      saved: existing ? existing.saved : 0,
      due: Number(due || 1),
      frequency,
      company
    };
    onSave(billData);
  }

  return (
    <ScrollView contentContainerStyle={[styles.form, common.screen]}>
      <Text style={styles.title}>{existing ? 'Edit Bill' : 'Add a Bill'}</Text>
      <TextInput placeholder="Bill Name" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Amount" style={styles.input} keyboardType="numeric" value={amount} onChangeText={setAmount} />
      <TextInput placeholder="Due Date (e.g., 15)" style={styles.input} keyboardType="numeric" value={due} onChangeText={setDue} />
      <TextInput placeholder="Frequency (Monthly / Weekly / Yearly)" style={styles.input} value={frequency} onChangeText={setFrequency} />
      <TextInput placeholder="Company Name (Optional)" style={styles.input} value={company} onChangeText={setCompany} />
      <PrimaryButton title="Save Bill" onPress={handleSave} />
      <TouchableOpacity onPress={()=>navigation.goBack()}><Text style={[styles.link,{marginTop:SPACING.md}]}>Cancel</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form:{padding:SPACING.md},
  title:{fontSize:20,fontWeight:'700',marginBottom:SPACING.sm},
  input:{borderWidth:1,borderColor:COLORS.border,padding:SPACING.sm,borderRadius:8,marginBottom:SPACING.sm},
  primaryButton:{backgroundColor:COLORS.primary,padding:SPACING.sm,paddingHorizontal:SPACING.lg,borderRadius:8,marginTop:SPACING.md,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'},
  link:{color:COLORS.primary,marginTop:SPACING.sm}
});
