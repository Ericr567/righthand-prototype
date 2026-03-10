import React from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import ProgressBar from '../components/ProgressBar';

import common, {SPACING} from '../styles/common';

export default function SavingsBreakdownScreen({bills=[]}){
  if (bills.length === 0) {
    bills = [
      {id:1,name:'Light Bill',saved:38,amount:150},
      {id:2,name:'Phone Bill',saved:22,amount:90},
      {id:3,name:'Rent',saved:250,amount:1250}
    ];
  }

  const total = bills.reduce((s,b)=>s+(b.saved||0),0);
  return (
    <ScrollView style={common.screen}>
      <Text style={[common.title, common.titleBlock]}>Savings Breakdown</Text>
      {bills.map(b=>(
        <View key={b.id} style={styles.itemRow}>
          <View style={{flex:1}}>
            <Text style={common.sectionTitle}>{b.name}</Text>
            <ProgressBar progress={Math.min(1,(b.saved||0)/b.amount)} label={`$${b.saved} / $${b.amount}`} small />
          </View>
        </View>
      ))}
      <Text style={[common.sectionTitle, {marginTop:SPACING.md}]}>Total Saved: ${total}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  itemRow:{paddingVertical:8}
});
