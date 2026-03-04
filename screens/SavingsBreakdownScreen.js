import React from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import ProgressBar from '../components/ProgressBar';

import common, {SPACING} from '../styles/common';

export default function SavingsBreakdownScreen({bills=[]}){
  const total = bills.reduce((s,b)=>s+(b.saved||0),0);
  return (
    <ScrollView style={common.screen}>
      <Text style={common.title}>Savings Breakdown</Text>
      {bills.map(b=>(
        <View key={b.id} style={styles.itemRow}>
          <View style={{flex:1}}>
            <Text style={{fontWeight:'600'}}>{b.name}</Text>
            <ProgressBar progress={Math.min(1,(b.saved||0)/b.amount)} label={`$${b.saved} / $${b.amount}`} small />
          </View>
        </View>
      ))}
      <Text style={{fontWeight:'700',marginTop:SPACING.md}}>Total Saved: ${total}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,padding:16},
  title:{fontSize:20,fontWeight:'700'},
  itemRow:{paddingVertical:8}
});
