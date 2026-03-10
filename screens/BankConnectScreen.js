import React, {useMemo, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

export default function BankConnectScreen({navigation}){
  const banks = [
    {name:'Chase', logo:'🏦'},
    {name:'Bank of America', logo:'🏦'},
    {name:'Wells Fargo', logo:'🏦'},
    {name:'Capital One', logo:'🏦'},
    {name:'Citi', logo:'🏦'}
  ];
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredBanks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return banks;
    return banks.filter((bank) => bank.name.toLowerCase().includes(q));
  }, [banks, query]);

  function handleContinue() {
    setShowSuccess(true);
    setTimeout(() => navigation.replace('Main'), 600);
  }

  return (
    <View style={common.screen}>
      <Text style={[common.title, common.titleBlock]}>Connect Your Bank</Text>
      <Text style={[common.caption, styles.topCaption]}>Secure connection powered by Plaid</Text>

      <TextInput
        placeholder="Search your bank"
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
      />

      <ScrollView style={common.sectionBlockTight}>
        {filteredBanks.map((bank)=>(
          <TouchableOpacity key={bank.name} style={[styles.bankItem, selected === bank.name && styles.bankSelected]} onPress={()=>setSelected(bank.name)}>
            <Text style={common.body}>{bank.logo} {bank.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selected && (
        <View style={styles.credentialsCard}>
          <Text style={common.sectionTitle}>Sign in with bank credentials</Text>
          <Text style={[common.caption, styles.selectedBankText]}>Selected bank: {selected}</Text>
          <TouchableOpacity style={styles.connectButton} onPress={handleContinue}>
            <Text style={styles.connectButtonText}>Continue Secure Sign In</Text>
          </TouchableOpacity>
        </View>
      )}

      {showSuccess && (
        <View style={styles.successBubble}>
          <Text style={styles.successText}>Success! Bank connected.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topCaption:{marginTop:0},
  searchInput:{marginTop:SPACING.md,borderWidth:1,borderColor:COLORS.border,padding:SPACING.sm,borderRadius:8},
  smallText:{marginTop:SPACING.xs},
  bankItem:{padding:SPACING.sm,backgroundColor:COLORS.background,borderRadius:8,marginBottom:SPACING.sm,borderWidth:1,borderColor:COLORS.border}
  ,bankSelected:{borderColor:COLORS.primary,borderWidth:2}
  ,credentialsCard:{marginTop:SPACING.md,borderWidth:1,borderColor:COLORS.border,borderRadius:10,padding:SPACING.md}
  ,selectedBankText:{marginTop:SPACING.xs}
  ,connectButton:{marginTop:SPACING.sm,backgroundColor:COLORS.primary,padding:SPACING.sm,borderRadius:8,alignItems:'center'}
  ,connectButtonText:{color:'#fff',fontWeight:'700'}
  ,successBubble:{position:'absolute',bottom:SPACING.md,left:SPACING.md,right:SPACING.md,backgroundColor:COLORS.successBg,padding:SPACING.sm,borderRadius:8,borderWidth:1,borderColor:COLORS.successBorder}
  ,successText:{color:COLORS.successText,textAlign:'center',fontWeight:'600'}
});
