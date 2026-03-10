import React, {useState, useEffect} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';

export default function AddBillScreen({navigation, route, onSave}){
  const existing = route.params?.bill;
  const [name,setName]=useState('');
  const [amount,setAmount]=useState('');
  const [due,setDue]=useState('15');
  const [frequency,setFrequency]=useState('Monthly');
  const [company,setCompany]=useState('');
  const [showDuePicker, setShowDuePicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);

  const dueDateOptions = ['1', '5', '10', '15', '20', '25', '30'];
  const frequencyOptions = ['Monthly', 'Weekly', 'Yearly'];

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
      <Text style={[common.title, common.titleBlock]}>{existing ? 'Edit Bill' : 'Add a Bill'}</Text>
      <TextInput placeholder="Bill Name" style={common.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Amount" style={common.input} keyboardType="numeric" value={amount} onChangeText={setAmount} />

      <TouchableOpacity style={common.input} onPress={() => setShowDuePicker((prev) => !prev)}>
        <Text style={common.body}>Due Date (Calendar Picker): {due}th</Text>
      </TouchableOpacity>
      {showDuePicker && (
        <View style={styles.pickerPanel}>
          {dueDateOptions.map((option) => (
            <TouchableOpacity key={option} style={[styles.optionChip, due === option && styles.optionChipSelected]} onPress={() => { setDue(option); setShowDuePicker(false); }}>
              <Text style={due === option ? styles.optionTextSelected : common.body}>{option}th</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity style={common.input} onPress={() => setShowFrequencyPicker((prev) => !prev)}>
        <Text style={common.body}>Frequency (Dropdown): {frequency}</Text>
      </TouchableOpacity>
      {showFrequencyPicker && (
        <View style={styles.pickerPanel}>
          {frequencyOptions.map((option) => (
            <TouchableOpacity key={option} style={[styles.optionChip, frequency === option && styles.optionChipSelected]} onPress={() => { setFrequency(option); setShowFrequencyPicker(false); }}>
              <Text style={frequency === option ? styles.optionTextSelected : common.body}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TextInput placeholder="Company Name (Optional)" style={common.input} value={company} onChangeText={setCompany} />
      <PrimaryButton title="Save Bill" onPress={handleSave} style={styles.button} />
      <TouchableOpacity onPress={()=>navigation.goBack()}><Text style={[styles.link,{marginTop:SPACING.md}]}>Cancel</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form:{padding:SPACING.md},
  pickerPanel:{marginBottom:SPACING.sm,flexDirection:'row',flexWrap:'wrap',gap:SPACING.xs},
  optionChip:{borderWidth:1,borderColor:COLORS.border,borderRadius:8,paddingVertical:SPACING.xs,paddingHorizontal:SPACING.sm},
  optionChipSelected:{borderColor:COLORS.primary,backgroundColor:COLORS.subtleBg},
  optionTextSelected:{color:COLORS.primary,fontWeight:'700'},
  button:{marginTop:SPACING.xs},
  link:{color:COLORS.primary,marginTop:SPACING.sm}
});
