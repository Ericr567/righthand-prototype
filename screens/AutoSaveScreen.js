import React, {useState} from 'react';
import {ScrollView, View, Text, TextInput, TouchableOpacity, Switch, StyleSheet} from 'react-native';
import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';

const FREQUENCIES = ['Weekly', 'Bi-weekly', 'Semi-monthly', 'Monthly'];

export default function AutoSaveScreen({route, navigation}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const existing = route?.params?.autoSave || {};

  const [enabled, setEnabled]       = useState(existing.enabled ?? false);
  const [amountType, setAmountType] = useState(existing.amountType ?? 'fixed');
  const [amount, setAmount]         = useState(existing.amount != null ? String(existing.amount) : '');
  const [frequency, setFrequency]   = useState(existing.frequency ?? 'Bi-weekly');
  const [nextPayDate, setNextPayDate] = useState(existing.nextPayDate ?? '');

  function handleSave(){
    const config = {
      enabled,
      amountType,
      amount: parseFloat(amount) || 0,
      frequency,
      nextPayDate,
    };
    route?.params?.onSave?.(config);
    navigation.goBack();
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={{paddingBottom:40}}>
      <Text style={[common.title, common.titleBlock]}>Auto Save</Text>
      <Text style={[common.body, {marginBottom: SPACING.lg, color: colors.textSecondary}]}>
        RightHand sets aside money automatically each time you get paid, so your bills are always covered.
      </Text>

      {/* Enable toggle */}
      <View style={styles.toggleRow}>
        <Text style={common.sectionTitle}>Enable Auto Save</Text>
        <Switch
          value={enabled}
          onValueChange={setEnabled}
          trackColor={{false: colors.border, true: colors.primary}}
          thumbColor={colors.white}
        />
      </View>

      {enabled && (
        <>
          {/* Save amount */}
          <View style={styles.section}>
            <Text style={common.sectionTitle}>How much to save each paycheck?</Text>

            {/* Fixed / Percent toggle */}
            <View style={styles.segmentRow}>
              {['fixed','percent'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.segment, amountType === type && styles.segmentActive]}
                  onPress={() => setAmountType(type)}
                >
                  <Text style={amountType === type ? styles.segmentTextActive : styles.segmentText}>
                    {type === 'fixed' ? 'Fixed $' : 'Percent %'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountPrefix}>{amountType === 'fixed' ? '$' : '%'}</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="decimal-pad"
                placeholder={amountType === 'fixed' ? '0.00' : '0'}
                placeholderTextColor={colors.border}
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <Text style={[common.caption, {color: colors.textSecondary, marginTop: SPACING.xs}]}>
              {amountType === 'fixed'
                ? 'This amount will be moved to savings automatically each pay period.'
                : 'This percentage of your paycheck will be moved to savings each pay period.'}
            </Text>
          </View>

          {/* Pay frequency */}
          <View style={styles.section}>
            <Text style={common.sectionTitle}>How often are you paid?</Text>
            <View style={styles.chipRow}>
              {FREQUENCIES.map(f => (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, frequency === f && styles.chipActive]}
                  onPress={() => setFrequency(f)}
                >
                  <Text style={frequency === f ? styles.chipTextActive : styles.chipText}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Pay schedule */}
          <View style={styles.section}>
            <Text style={common.sectionTitle}>Next pay date</Text>
            <TextInput
              style={common.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.border}
              value={nextPayDate}
              onChangeText={setNextPayDate}
            />
            <Text style={[common.caption, {color: colors.textSecondary, marginTop: SPACING.xs}]}>
              RightHand uses this to predict when your next auto save will run.
            </Text>
          </View>
        </>
      )}

      <PrimaryButton title="Save" onPress={handleSave} style={{marginTop: SPACING.md}} />
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  toggleRow:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    backgroundColor:colors.white,
    padding:SPACING.md,
    borderRadius:12,
    borderWidth:1,
    borderColor:colors.border,
    marginBottom:SPACING.md,
  },
  section:{
    backgroundColor:colors.white,
    padding:SPACING.md,
    borderRadius:12,
    borderWidth:1,
    borderColor:colors.border,
    marginBottom:SPACING.md,
  },
  segmentRow:{
    flexDirection:'row',
    borderWidth:1,
    borderColor:colors.border,
    borderRadius:8,
    overflow:'hidden',
    marginTop:SPACING.sm,
    marginBottom:SPACING.sm,
  },
  segment:{
    flex:1,
    paddingVertical:8,
    alignItems:'center',
    backgroundColor:colors.subtleBg,
  },
  segmentActive:{
    backgroundColor:colors.primary,
  },
  segmentText:{
    fontFamily:'Inter',
    fontSize:14,
    color:colors.textSecondary,
  },
  segmentTextActive:{
    fontFamily:'Inter',
    fontSize:14,
    fontWeight:'700',
    color:colors.white,
  },
  amountRow:{
    flexDirection:'row',
    alignItems:'center',
    borderWidth:1,
    borderColor:colors.border,
    borderRadius:8,
    paddingHorizontal:SPACING.sm,
    marginTop:SPACING.xs,
    backgroundColor:colors.background,
  },
  amountPrefix:{
    fontSize:18,
    fontWeight:'700',
    color:colors.primary,
    marginRight:6,
  },
  amountInput:{
    flex:1,
    fontSize:18,
    fontFamily:'Inter',
    color:colors.text,
    paddingVertical:10,
    outlineStyle:'none',
  },
  chipRow:{
    flexDirection:'row',
    flexWrap:'wrap',
    gap:8,
    marginTop:SPACING.sm,
  },
  chip:{
    paddingHorizontal:14,
    paddingVertical:8,
    borderRadius:20,
    borderWidth:1,
    borderColor:colors.border,
    backgroundColor:colors.subtleBg,
  },
  chipActive:{
    borderColor:colors.primary,
    backgroundColor:colors.primary,
  },
  chipText:{
    fontFamily:'Inter',
    fontSize:14,
    color:colors.textSecondary,
  },
  chipTextActive:{
    fontFamily:'Inter',
    fontSize:14,
    fontWeight:'700',
    color:colors.white,
  },
});
