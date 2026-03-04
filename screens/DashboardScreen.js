import React from 'react';
import {ScrollView, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

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
  // compute total amount still needed for bills (amount minus saved)
  const nextPull = bills.reduce((sum,b)=>{
    const remaining = (b.amount || 0) - (b.saved || 0);
    return sum + (remaining > 0 ? remaining : 0);
  }, 0) || 38;
  const totalSaved = bills.reduce((s,b)=>s+(b.saved||0),0);

  return (
    <ScrollView style={common.screen} contentContainerStyle={{paddingBottom:120}}>
      <Text style={[styles.greeting, {color: COLORS.text}]}>Good Morning, {userName}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Savings Pull</Text>
        <Text style={styles.cardAmount}>${nextPull} will be saved on Friday</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next Bill Payment</Text>
        <Text>Light Bill: $150 due on 15th – Scheduled</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Saved This Month</Text>
        <ProgressBar progress={Math.min(1, totalSaved / 1500)} label={`$${totalSaved}`} />
      </View>

      <View style={{marginTop:SPACING.md}}>
        <Text style={{fontWeight:'700',marginBottom:SPACING.sm}}>Your Bills</Text>
        {bills.map(b=> (
          <TouchableOpacity key={b.id} style={styles.billRow} onPress={()=>navigation.navigate('BillDetails',{bill:b})}>
            <View>
              <Text style={{fontWeight:'600'}}>{b.name}</Text>
              <Text style={{color:COLORS.textSecondary}}>${b.saved} / ${b.amount}</Text>
            </View>
            <Text style={{color:COLORS.textSecondary}}>{b.due}th</Text>
          </TouchableOpacity>
        ))}
      </View>

      <PrimaryButton title="Add Bill" onPress={()=>navigation.navigate('AddBill')} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // screen style is now in common
  card:{backgroundColor:COLORS.background,padding:SPACING.sm,borderRadius:10,marginBottom:SPACING.md},
  cardTitle:{fontWeight:'700',marginBottom:SPACING.xs},
  cardAmount:{fontSize:16,fontWeight:'600'},
  billRow:{flexDirection:'row',justifyContent:'space-between',padding:SPACING.sm,backgroundColor:COLORS.background,borderRadius:8,marginBottom:SPACING.sm,borderWidth:1,borderColor:COLORS.border},
  primaryButton:{backgroundColor:COLORS.primary,padding:SPACING.sm,paddingHorizontal:SPACING.lg,borderRadius:8,marginTop:SPACING.md,alignItems:'center'},
  btnText:{color:'#fff',fontWeight:'700'},
  greeting:{fontSize:18,fontWeight:'700',marginBottom:SPACING.md}
});
