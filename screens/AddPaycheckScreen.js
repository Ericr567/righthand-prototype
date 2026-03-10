import React, {useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';

export default function AddPaycheckScreen({navigation}){
  const [freq,setFreq]=useState('Bi-weekly');
  const [nextDate,setNextDate]=useState('2026-03-01');
  const [amt,setAmt]=useState('');
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const frequencies = ['Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly'];

  return (
    <ScrollView contentContainerStyle={[styles.form, common.screen]}>
      <Text style={[common.title, common.titleBlock]}>Your Pay Schedule</Text>

      <Text style={common.sectionTitle}>How often are you paid?</Text>
      <TouchableOpacity style={common.input} onPress={() => setShowFrequencyDropdown((prev) => !prev)}>
        <Text style={common.body}>Dropdown: {freq}</Text>
      </TouchableOpacity>
      {showFrequencyDropdown && (
        <View style={styles.optionsWrap}>
          {frequencies.map((item) => (
            <TouchableOpacity key={item} onPress={() => { setFreq(item); setShowFrequencyDropdown(false); }} style={[styles.optionBtn, freq === item && styles.optionSelected]}>
              <Text style={freq === item ? styles.optionSelectedText : common.body}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TextInput placeholder="Next Paycheck Date" style={common.input} value={nextDate} onChangeText={setNextDate} />
      <TextInput placeholder="Usual Deposit Amount (Optional)" style={common.input} value={amt} onChangeText={setAmt} />
      <PrimaryButton title="Save Schedule" onPress={()=>navigation.goBack()} style={styles.button} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form:{padding:SPACING.md},
  optionsWrap:{marginBottom:SPACING.md},
  optionBtn:{borderWidth:1,borderColor:COLORS.border,padding:SPACING.sm,borderRadius:8,marginBottom:SPACING.xs},
  optionSelected:{borderColor:COLORS.primary,backgroundColor:COLORS.subtleBg},
  optionSelectedText:{color:COLORS.primary,fontWeight:'700'},
  button:{marginTop:SPACING.xs}
});
