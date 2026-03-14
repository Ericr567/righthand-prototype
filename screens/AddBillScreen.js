import React, {useState, useEffect} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import PrimaryButton from '../components/PrimaryButton';

const DUE_OPTIONS  = ['1','5','10','15','20','25','30'];
const FREQ_OPTIONS = ['Monthly','Weekly','Yearly'];

export default function AddBillScreen({navigation, route, onSave}){
  const existing = route.params?.bill;
  const [name,     setName]     = useState('');
  const [amount,   setAmount]   = useState('');
  const [due,      setDue]      = useState('15');
  const [frequency,setFrequency]= useState('Monthly');
  const [company,  setCompany]  = useState('');
  const [showDue,  setShowDue]  = useState(false);
  const [showFreq, setShowFreq] = useState(false);

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
    onSave({
      id: existing ? existing.id : Date.now(),
      name, amount: Number(amount || 0),
      saved: existing ? existing.saved : 0,
      due: Number(due || 1),
      frequency, company,
    });
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>{existing ? 'Edit Bill' : 'Add a Bill'}</Text>

      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Bill Name</Text>
        <TextInput
          placeholder="e.g. Electric, Rent"
          placeholderTextColor={COLORS.border}
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={[styles.fieldLabel, {marginTop:SPACING.sm}]}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountPrefix}>$</Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor={COLORS.border}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        <Text style={[styles.fieldLabel, {marginTop:SPACING.sm}]}>Company / Provider (optional)</Text>
        <TextInput
          placeholder="e.g. AT&T, Duke Energy"
          placeholderTextColor={COLORS.border}
          style={styles.input}
          value={company}
          onChangeText={setCompany}
        />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Due Date</Text>
        <Text style={styles.fieldHint}>Which day of the month is this bill due?</Text>
        <View style={styles.chipRow}>
          {DUE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, due === opt && styles.chipActive]}
              onPress={() => setDue(opt)}
            >
              <Text style={[styles.chipText, due === opt && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Frequency</Text>
        <View style={styles.chipRow}>
          {FREQ_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt}
              style={[styles.chip, frequency === opt && styles.chipActive]}
              onPress={() => setFrequency(opt)}
            >
              <Text style={[styles.chipText, frequency === opt && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <PrimaryButton title={existing ? 'Save Changes' : 'Add Bill'} onPress={handleSave} style={{marginTop:SPACING.xs}} />
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:SPACING.md,paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:COLORS.text,marginBottom:SPACING.md},

  formCard:{
    backgroundColor:COLORS.white,borderRadius:16,padding:SPACING.md,
    borderWidth:1,borderColor:COLORS.border,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  fieldLabel:{fontSize:13,fontWeight:'700',fontFamily:'Inter',color:COLORS.text,marginBottom:4},
  fieldHint:{fontSize:12,fontFamily:'Inter',color:COLORS.textSecondary,marginBottom:SPACING.sm},

  input:{
    borderWidth:1,borderColor:COLORS.border,borderRadius:10,
    padding:SPACING.sm,fontFamily:'Inter',fontSize:15,color:COLORS.text,
    backgroundColor:COLORS.background,outlineStyle:'none',
  },
  amountRow:{
    flexDirection:'row',alignItems:'center',
    borderWidth:1,borderColor:COLORS.border,borderRadius:10,
    paddingHorizontal:SPACING.sm,backgroundColor:COLORS.background,
  },
  amountPrefix:{fontSize:20,fontWeight:'700',color:COLORS.primary,marginRight:6},
  amountInput:{flex:1,fontSize:20,fontFamily:'Inter',color:COLORS.text,paddingVertical:10,outlineStyle:'none'},

  chipRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:SPACING.xs},
  chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.background},
  chipActive:{borderColor:COLORS.primary,backgroundColor:COLORS.primary},
  chipText:{fontSize:14,fontFamily:'Inter',color:COLORS.textSecondary},
  chipTextActive:{fontSize:14,fontFamily:'Inter',fontWeight:'700',color:COLORS.white},

  cancelBtn:{alignItems:'center',paddingVertical:SPACING.md},
  cancelText:{fontSize:14,fontFamily:'Inter',color:COLORS.textSecondary},
});
