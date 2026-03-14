import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView} from 'react-native';
import ProgressBar from '../components/ProgressBar';

import common, {SPACING, COLORS} from '../styles/common';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function getNextDueDate(day) {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), day);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function BillDetailsScreen({route, navigation, onDelete, onSave, transactions=[], onAddTransaction}){
  const bill = route.params?.bill;
  const [logAmount, setLogAmount] = useState('');
  const [logNote,   setLogNote]   = useState('');
  const [showLog,   setShowLog]   = useState(false);

  if (!bill) return <View style={common.screen}><Text>No bill selected</Text></View>;

  const saved       = bill.saved || 0;
  const target      = bill.amount || 0;
  const remaining   = Math.max(0, target - saved);
  const pct         = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const nextAmt     = Math.max(0, Math.round(remaining / 4));

  function handleLogTransfer(){
    const amt = Number(logAmount);
    if (!amt || amt <= 0) return;
    onAddTransaction && onAddTransaction({
      billId: bill.id,
      amount: amt,
      date: new Date().toISOString().slice(0, 10),
      note: logNote.trim() || 'Manual savings transfer',
    });
    setLogAmount('');
    setLogNote('');
    setShowLog(false);
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      {/* Bill hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroName}>{bill.name}</Text>
            <Text style={styles.heroFreq}>{bill.frequency || 'Monthly'} · Due {getNextDueDate(bill.due)}</Text>
          </View>
          <View>
            <Text style={styles.heroAmount}>${target}</Text>
            <View style={[styles.autoPill, bill.autoPay ? styles.autoPillOn : styles.autoPillOff]}>
              <Text style={[styles.autoPillText, bill.autoPay ? styles.autoPillTextOn : styles.autoPillTextOff]}>
                {bill.autoPay ? '⚡ Auto-Pay' : '✋ Manual'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <ProgressBar progress={Math.min(1, saved / (target || 1))} />
        <View style={styles.heroProgressMeta}>
          <Text style={styles.heroPctText}>{pct}% saved</Text>
          <Text style={styles.heroRemText}>${saved} of ${target}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, {marginRight:8}]}>
          <Text style={styles.statNumber}>${saved}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
        <View style={[styles.statCard, {marginRight:8}]}>
          <Text style={styles.statNumber}>${remaining}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${nextAmt}</Text>
          <Text style={styles.statLabel}>Next transfer</Text>
        </View>
      </View>

      {/* Log transfer */}
      <TouchableOpacity
        style={[styles.logButton, showLog && styles.logButtonCancel]}
        onPress={() => setShowLog(p => !p)}
      >
        <Text style={[styles.logButtonText, showLog && styles.logButtonTextCancel]}>
          {showLog ? 'Cancel' : '+ Log Savings Transfer'}
        </Text>
      </TouchableOpacity>

      {showLog && (
        <View style={styles.logForm}>
          <View style={styles.amountRow}>
            <Text style={styles.amountPrefix}>$</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor={COLORS.border}
              keyboardType="decimal-pad"
              style={styles.amountInput}
              value={logAmount}
              onChangeText={setLogAmount}
            />
          </View>
          <TextInput
            placeholder="Note (optional)"
            placeholderTextColor={COLORS.border}
            style={styles.noteInput}
            value={logNote}
            onChangeText={setLogNote}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleLogTransfer}>
            <Text style={styles.saveButtonText}>Save Transfer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transfer history */}
      {transactions.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Transfer History</Text>
          {[...transactions].reverse().map((tx) => (
            <View key={tx.id} style={styles.txRow}>
              <View style={styles.txDot} />
              <View style={styles.txContent}>
                <Text style={styles.txNote}>{tx.note}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={styles.txAmount}>+${tx.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('AddBill', {bill})}>
          <Text style={styles.editButtonText}>Edit Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => { onDelete && onDelete(bill.id); }}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},

  heroCard:{
    backgroundColor:COLORS.primary,
    borderRadius:18,padding:SPACING.lg,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.15,shadowRadius:12,elevation:4,
  },
  heroTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:SPACING.md},
  heroName:{fontSize:22,fontWeight:'800',fontFamily:'Inter',color:'#fff'},
  heroFreq:{fontSize:13,fontFamily:'Inter',color:'rgba(255,255,255,0.7)',marginTop:2},
  heroAmount:{fontSize:28,fontWeight:'800',fontFamily:'Inter',color:'#fff',textAlign:'right'},
  autoPill:{borderRadius:20,paddingHorizontal:10,paddingVertical:4,marginTop:4,borderWidth:1},
  autoPillOn:{backgroundColor:'rgba(255,255,255,0.15)',borderColor:'rgba(255,255,255,0.3)'},
  autoPillOff:{backgroundColor:'rgba(0,0,0,0.1)',borderColor:'rgba(255,255,255,0.2)'},
  autoPillText:{fontSize:11,fontWeight:'700',fontFamily:'Inter'},
  autoPillTextOn:{color:'#fff'},
  autoPillTextOff:{color:'rgba(255,255,255,0.7)'},
  heroProgressMeta:{flexDirection:'row',justifyContent:'space-between',marginTop:6},
  heroPctText:{fontSize:12,fontFamily:'Inter',color:'rgba(255,255,255,0.8)'},
  heroRemText:{fontSize:12,fontFamily:'Inter',color:'rgba(255,255,255,0.8)'},

  statsRow:{flexDirection:'row',marginBottom:SPACING.md},
  statCard:{
    flex:1,backgroundColor:COLORS.white,borderRadius:12,padding:SPACING.sm,
    borderWidth:1,borderColor:COLORS.border,alignItems:'center',
    shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4,elevation:1,
  },
  statNumber:{fontSize:18,fontWeight:'800',fontFamily:'Inter',color:COLORS.primary},
  statLabel:{fontSize:10,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2,textAlign:'center'},

  logButton:{
    borderWidth:1.5,borderColor:COLORS.primary,borderRadius:12,
    padding:SPACING.md,alignItems:'center',marginBottom:SPACING.md,
  },
  logButtonCancel:{borderColor:COLORS.border,backgroundColor:COLORS.subtleBg},
  logButtonText:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:COLORS.primary},
  logButtonTextCancel:{color:COLORS.textSecondary},

  logForm:{
    backgroundColor:COLORS.white,borderRadius:14,padding:SPACING.md,
    borderWidth:1,borderColor:COLORS.border,marginBottom:SPACING.md,gap:SPACING.sm,
  },
  amountRow:{
    flexDirection:'row',alignItems:'center',
    borderWidth:1,borderColor:COLORS.border,borderRadius:10,
    paddingHorizontal:SPACING.sm,backgroundColor:COLORS.background,
  },
  amountPrefix:{fontSize:20,fontWeight:'700',color:COLORS.primary,marginRight:6},
  amountInput:{flex:1,fontSize:20,fontFamily:'Inter',color:COLORS.text,paddingVertical:10,outlineStyle:'none'},
  noteInput:{
    borderWidth:1,borderColor:COLORS.border,borderRadius:10,padding:SPACING.sm,
    fontFamily:'Inter',fontSize:14,color:COLORS.text,backgroundColor:COLORS.background,outlineStyle:'none',
  },
  saveButton:{backgroundColor:COLORS.primary,borderRadius:10,padding:SPACING.md,alignItems:'center'},
  saveButtonText:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:'#fff'},

  historyCard:{
    backgroundColor:COLORS.white,borderRadius:14,padding:SPACING.md,
    borderWidth:1,borderColor:COLORS.border,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4,elevation:1,
  },
  historyTitle:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:COLORS.textSecondary,letterSpacing:1,textTransform:'uppercase',marginBottom:SPACING.sm,
  },
  txRow:{flexDirection:'row',alignItems:'flex-start',paddingVertical:8,borderTopWidth:1,borderTopColor:COLORS.border},
  txDot:{width:8,height:8,borderRadius:4,backgroundColor:COLORS.primary,marginTop:4,marginRight:10},
  txContent:{flex:1},
  txNote:{fontSize:13,fontWeight:'500',fontFamily:'Inter',color:COLORS.text},
  txDate:{fontSize:11,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:1},
  txAmount:{fontSize:14,fontWeight:'700',fontFamily:'Inter',color:COLORS.primary},

  actionsRow:{flexDirection:'row',gap:SPACING.sm},
  editButton:{
    flex:1,borderWidth:1,borderColor:COLORS.border,borderRadius:12,
    padding:SPACING.md,alignItems:'center',backgroundColor:COLORS.white,
  },
  editButtonText:{fontSize:14,fontWeight:'600',fontFamily:'Inter',color:COLORS.text},
  deleteButton:{
    flex:1,backgroundColor:COLORS.dangerBg,borderRadius:12,
    padding:SPACING.md,alignItems:'center',borderWidth:1,borderColor:COLORS.dangerBorder,
  },
  deleteButtonText:{fontSize:14,fontWeight:'700',fontFamily:'Inter',color:COLORS.dangerText},
});

