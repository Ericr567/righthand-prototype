import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ProgressBar from '../components/ProgressBar';

import common, {SPACING, COLORS} from '../styles/common';

export default function BillDetailsScreen({route, navigation, onDelete, onSave}){
  const bill = route.params?.bill;
  if(!bill) return <View style={common.screen}><Text>No bill selected</Text></View>;

  const remaining = Math.max(0, (bill.amount || 0) - (bill.saved || 0));
  return (
    <View style={common.screen}>
      <Text style={common.title}>{bill.name}</Text>
      <ProgressBar progress={Math.min(1,bill.saved/bill.amount)} label={`$${bill.saved} / $${bill.amount}`} />
      <Text style={{marginTop:SPACING.sm}}>Next Withdrawal: ${remaining} scheduled</Text>
      <Text>Due Date: {bill.due}th of every month</Text>
      <Text>Payment Status: Scheduled</Text>
      <TouchableOpacity style={styles.secondaryButton} onPress={()=>navigation.navigate('AddBill',{bill})}><Text>Edit Bill</Text></TouchableOpacity>
      <TouchableOpacity style={styles.ghostButton} onPress={()=>{onDelete && onDelete(bill.id);}}><Text style={{color:'red'}}>Delete Bill</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // screen and title provided by common
  secondaryButton:{backgroundColor:COLORS.border,padding:SPACING.sm,borderRadius:8,marginTop:SPACING.md,alignItems:'center'},
  ghostButton:{marginTop:SPACING.sm,alignItems:'center'}
});
