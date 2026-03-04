import React from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

export default function BankConnectScreen({navigation}){
  const banks = ['Bank A','Bank B','First National','Community Bank','Credit Union'];
  return (
    <View style={common.screen}>
      <Text style={common.title}>Connect Your Bank</Text>
      <Text style={{color:COLORS.textSecondary, marginTop:SPACING.xs}}>Secure connection powered by Plaid</Text>
      <ScrollView style={{marginTop:SPACING.sm}}>
        {banks.map((b,i)=>(
          <TouchableOpacity key={i} style={styles.bankItem} onPress={()=>navigation.replace('Main')}>
            <Text>{b}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  smallText:{marginTop:SPACING.xs},
  bankItem:{padding:SPACING.sm,backgroundColor:COLORS.background,borderRadius:8,marginBottom:SPACING.sm,borderWidth:1,borderColor:COLORS.border}
});
