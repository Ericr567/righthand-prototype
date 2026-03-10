import React from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import ProgressBar from '../components/ProgressBar';

export default function DashboardScreen({navigation, userName='Alex', bills=[]}){
  // stub a few bills for preview if none provided
  if (bills.length === 0) {
    bills = [
      {id:1,name:'Electric',amount:150,saved:90,due:15},
      {id:2,name:'Internet',amount:60,saved:60,due:20},
    ];
  }
  const totalSaved = bills.reduce((s,b)=>s+(b.saved||0),0);

  return (
    <ScrollView style={common.screen} contentContainerStyle={{paddingBottom:120}}>
      <Text style={[styles.greeting, common.titleBlock]}>Good Morning, {userName}</Text>

      <View style={styles.card}>
        <Text style={common.sectionTitle}>Next Savings Pull</Text>
        <Text style={common.body}>$38 will be saved on Friday</Text>
      </View>

      <View style={styles.card}>
        <Text style={common.sectionTitle}>Next Bill Payment</Text>
        <Text style={common.body}>Light Bill: $150 due on 15th – Scheduled</Text>
      </View>

      <View style={styles.card}>
        <Text style={common.sectionTitle}>Total Saved This Month</Text>
        <ProgressBar progress={Math.min(1, totalSaved / 1500)} label={`$${totalSaved}`} />
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card:{backgroundColor:COLORS.background,padding:SPACING.sm,borderRadius:10,marginBottom:SPACING.md,borderWidth:1,borderColor:COLORS.border},
  greeting:{fontSize:24,fontWeight:'700',marginBottom:SPACING.md,color:COLORS.text}
});
