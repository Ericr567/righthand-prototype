import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ProgressBar from '../components/ProgressBar';

import common, {SPACING, COLORS} from '../styles/common';

export default function BillDetailsScreen({route, navigation, onDelete, onSave}){
  const bill = route.params?.bill;
  if(!bill) return <View style={common.screen}><Text>No bill selected</Text></View>;

  const nextWithdrawal = Math.max(0, Math.round((bill.amount || 0) * 0.25));
  return (
    <View style={common.screen}>
      <Text style={[common.title, common.titleBlock]}>{bill.name}</Text>
      <ProgressBar progress={Math.min(1,bill.saved/bill.amount)} label={`$${bill.saved} / $${bill.amount}`} />
      <Text style={[common.body, styles.infoTop]}>Next Withdrawal: ${nextWithdrawal} on Friday</Text>
      <Text style={common.body}>Due Date: {bill.due}th of every month</Text>
      <Text style={common.body}>Payment Status: Scheduled</Text>
      <TouchableOpacity style={styles.secondaryButton} onPress={()=>navigation.navigate('AddBill',{bill})}><Text style={styles.secondaryText}>Edit Bill</Text></TouchableOpacity>
      <TouchableOpacity style={common.dangerButton} onPress={()=>{onDelete && onDelete(bill.id);}}><Text style={common.dangerButtonText}>Delete Bill</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  infoTop:{marginTop:SPACING.sm},
  secondaryButton:{backgroundColor:COLORS.border,padding:SPACING.sm,borderRadius:8,marginTop:SPACING.md,alignItems:'center'},
  secondaryText:{fontWeight:'600'},
});
