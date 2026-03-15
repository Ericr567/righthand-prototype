import React, {useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View} from 'react-native';

import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';

const FREQUENCIES = ['Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly'];

export default function AddPaycheckScreen({navigation}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const [freq,     setFreq]     = useState('Bi-weekly');
  const [nextDate, setNextDate] = useState('2026-03-01');
  const [amt,      setAmt]      = useState('');

  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Pay Schedule</Text>
      <Text style={styles.screenSub}>Tell RightHand when you get paid so it can plan your savings automatically.</Text>

      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>How often are you paid?</Text>
        <View style={styles.chipRow}>
          {FREQUENCIES.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, freq === f && styles.chipActive]}
              onPress={() => setFreq(f)}
            >
              <Text style={[styles.chipText, freq === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Next Paycheck Date</Text>
        <Text style={styles.fieldHint}>Enter the date of your next expected paycheck.</Text>
        <TextInput
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.border}
          style={styles.input}
          value={nextDate}
          onChangeText={setNextDate}
        />
      </View>

      <View style={styles.formCard}>
        <Text style={styles.fieldLabel}>Usual Deposit Amount</Text>
        <Text style={styles.fieldHint}>Optional — helps estimate your savings capacity.</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amountPrefix}>$</Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor={colors.border}
            keyboardType="decimal-pad"
            style={styles.amountInput}
            value={amt}
            onChangeText={setAmt}
          />
        </View>
      </View>

      <PrimaryButton title="Save Schedule" onPress={() => navigation.goBack()} style={{marginTop:SPACING.xs}} />
      <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.text,marginBottom:4},
  screenSub:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary,marginBottom:SPACING.md},

  formCard:{
    backgroundColor:colors.white,borderRadius:16,padding:SPACING.md,
    borderWidth:1,borderColor:colors.border,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  fieldLabel:{fontSize:13,fontWeight:'700',fontFamily:'Inter',color:colors.text,marginBottom:4},
  fieldHint:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginBottom:SPACING.sm},

  input:{
    borderWidth:1,borderColor:colors.border,borderRadius:10,
    padding:SPACING.sm,fontFamily:'Inter',fontSize:15,color:colors.text,
    backgroundColor:colors.background,outlineStyle:'none',
  },
  amountRow:{
    flexDirection:'row',alignItems:'center',
    borderWidth:1,borderColor:colors.border,borderRadius:10,
    paddingHorizontal:SPACING.sm,backgroundColor:colors.background,
  },
  amountPrefix:{fontSize:20,fontWeight:'700',color:colors.primary,marginRight:6},
  amountInput:{flex:1,fontSize:20,fontFamily:'Inter',color:colors.text,paddingVertical:10,outlineStyle:'none'},

  chipRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:SPACING.xs},
  chip:{paddingHorizontal:14,paddingVertical:8,borderRadius:20,borderWidth:1,borderColor:colors.border,backgroundColor:colors.background},
  chipActive:{borderColor:colors.primary,backgroundColor:colors.primary},
  chipText:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary},
  chipTextActive:{fontSize:14,fontFamily:'Inter',fontWeight:'700',color:colors.white},

  cancelBtn:{alignItems:'center',paddingVertical:SPACING.md},
  cancelText:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary},
});
