import React, {useState} from 'react';
import {Alert, View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView} from 'react-native';
import ProgressBar from '../components/ProgressBar';

import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function getNextDueDate(day) {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), day);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export default function BillDetailsScreen({route, navigation, onDelete, onSave, transactions = [], onAddTransaction}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
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
      <Text style={styles.screenTitle}>Bill Details</Text>

      {/* Bill hero */}
      <View
        style={styles.heroCard}
        accessible={true}
        accessibilityLabel={`${bill.name}, $${target} ${bill.frequency || 'Monthly'}, due ${getNextDueDate(bill.due)}, ${bill.autoPay ? 'Auto-Pay enabled' : 'Manual payment'}`}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroName} accessibilityRole="header">{bill.name}</Text>
            <Text style={styles.heroFreq}>{bill.frequency || 'Monthly'} · Due {getNextDueDate(bill.due)}</Text>
          </View>
          <View>
            <Text style={styles.heroAmount}>${target}</Text>
            <View
              style={[styles.autoPill, bill.autoPay ? styles.autoPillOn : styles.autoPillOff]}
              accessible={true}
              accessibilityLabel={bill.autoPay ? 'Auto-Pay enabled' : 'Manual payment'}
            >
              <Text style={[styles.autoPillText, bill.autoPay ? styles.autoPillTextOn : styles.autoPillTextOff]}>
                {bill.autoPay ? '⚡ Auto-Pay' : '✋ Manual'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <ProgressBar
          progress={Math.min(1, saved / (target || 1))}
          accessibilityLabel={`${pct}% saved, $${saved} of $${target}`}
        />
        <View style={styles.heroProgressMeta} importantForAccessibility="no-hide-descendants">
          <Text style={styles.heroPctText}>{pct}% saved</Text>
          <Text style={styles.heroRemText}>${saved} of ${target}</Text>
        </View>
      </View>

      {/* Stats row */}
      <Text style={styles.sectionHeader}>Funding Snapshot</Text>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, {marginRight:8}]} accessible={true} accessibilityLabel={`Saved: $${saved}`}>
          <Text style={styles.statNumber} importantForAccessibility="no">${saved}</Text>
          <Text style={styles.statLabel} importantForAccessibility="no">Saved</Text>
        </View>
        <View style={[styles.statCard, {marginRight:8}]} accessible={true} accessibilityLabel={`Remaining: $${remaining}`}>
          <Text style={styles.statNumber} importantForAccessibility="no">${remaining}</Text>
          <Text style={styles.statLabel} importantForAccessibility="no">Remaining</Text>
        </View>
        <View style={styles.statCard} accessible={true} accessibilityLabel={`Suggested next transfer: $${nextAmt}`}>
          <Text style={styles.statNumber} importantForAccessibility="no">${nextAmt}</Text>
          <Text style={styles.statLabel} importantForAccessibility="no">Next transfer</Text>
        </View>
      </View>

      {/* Log transfer */}
      <Text style={styles.sectionHeader}>Log Savings Transfer</Text>
      <TouchableOpacity
        style={[styles.logButton, showLog && styles.logButtonCancel]}
        onPress={() => setShowLog(p => !p)}
        accessibilityRole="button"
        accessibilityLabel={showLog ? 'Cancel savings transfer log' : 'Log a savings transfer'}
        accessibilityState={{expanded: showLog}}
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
              placeholderTextColor={colors.border}
              keyboardType="decimal-pad"
              style={styles.amountInput}
              value={logAmount}
              onChangeText={setLogAmount}
              accessibilityLabel="Transfer amount in dollars"
            />
          </View>
          <TextInput
            placeholder="Note (optional)"
            placeholderTextColor={colors.border}
            style={styles.noteInput}
            value={logNote}
            onChangeText={setLogNote}
            accessibilityLabel="Transfer note, optional"
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleLogTransfer}
            accessibilityRole="button"
            accessibilityLabel="Save savings transfer"
          >
            <Text style={styles.saveButtonText}>Save Transfer</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Transfers update this bill's saved total and timeline.</Text>
        </View>
      )}

      {/* Transfer history */}
      {transactions.length > 0 && (
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Transfer History</Text>
          {[...transactions].reverse().map((tx) => (
            <View
              key={tx.id}
              style={styles.txRow}
              accessible={true}
              accessibilityLabel={`${tx.note}, $${tx.amount} on ${tx.date}`}
            >
              <View style={styles.txDot} importantForAccessibility="no" />
              <View style={styles.txContent} importantForAccessibility="no-hide-descendants">
                <Text style={styles.txNote}>{tx.note}</Text>
                <Text style={styles.txDate}>{tx.date}</Text>
              </View>
              <Text style={styles.txAmount} importantForAccessibility="no">+${tx.amount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <Text style={styles.sectionHeader}>Bill Actions</Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddBill', {bill})}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${bill.name}`}
        >
          <Text style={styles.editButtonText}>Edit Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Bill',
              `Are you sure you want to delete "${bill.name}"? All transfer history will also be removed. This cannot be undone.`,
              [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Delete', style: 'destructive', onPress: () => onDelete && onDelete(bill.id)},
              ]
            );
          }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${bill.name}`}
          accessibilityHint="Permanently removes this bill and its history"
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.text,marginBottom:SPACING.md},
  sectionHeader:{
    fontSize:11,
    fontWeight:'700',
    fontFamily:'Inter',
    color:colors.textSecondary,
    letterSpacing:1,
    textTransform:'uppercase',
    marginBottom:8,
  },

  heroCard:{
    backgroundColor:colors.primary,
    borderRadius:18,padding:SPACING.lg,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.15,shadowRadius:12,elevation:4,
  },
  heroTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:SPACING.md},
  heroName:{fontSize:22,fontWeight:'800',fontFamily:'Inter',color:colors.onPrimary},
  heroFreq:{fontSize:13,fontFamily:'Inter',color:colors.onPrimaryMuted,marginTop:2},
  heroAmount:{fontSize:28,fontWeight:'800',fontFamily:'Inter',color:colors.onPrimary,textAlign:'right'},
  autoPill:{borderRadius:20,paddingHorizontal:10,paddingVertical:4,marginTop:4,borderWidth:1},
  autoPillOn:{backgroundColor:'rgba(255,255,255,0.15)',borderColor:'rgba(255,255,255,0.3)'},
  autoPillOff:{backgroundColor:'rgba(0,0,0,0.1)',borderColor:'rgba(255,255,255,0.2)'},
  autoPillText:{fontSize:11,fontWeight:'700',fontFamily:'Inter'},
  autoPillTextOn:{color:colors.onPrimary},
  autoPillTextOff:{color:'rgba(255,255,255,0.7)'},
  heroProgressMeta:{flexDirection:'row',justifyContent:'space-between',marginTop:6},
  heroPctText:{fontSize:12,fontFamily:'Inter',color:colors.onPrimaryMuted},
  heroRemText:{fontSize:12,fontFamily:'Inter',color:colors.onPrimaryMuted},

  statsRow:{flexDirection:'row',marginBottom:SPACING.md},
  statCard:{
    flex:1,backgroundColor:colors.white,borderRadius:12,padding:SPACING.sm,
    borderWidth:1,borderColor:colors.border,alignItems:'center',
    shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4,elevation:1,
  },
  statNumber:{fontSize:18,fontWeight:'800',fontFamily:'Inter',color:colors.primary},
  statLabel:{fontSize:10,fontFamily:'Inter',color:colors.textSecondary,marginTop:2,textAlign:'center'},

  logButton:{
    borderWidth:1.5,borderColor:colors.primary,borderRadius:12,
    padding:SPACING.md,alignItems:'center',marginBottom:SPACING.md,
  },
  logButtonCancel:{borderColor:colors.border,backgroundColor:colors.subtleBg},
  logButtonText:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:colors.primary},
  logButtonTextCancel:{color:colors.textSecondary},

  logForm:{
    backgroundColor:colors.white,borderRadius:14,padding:SPACING.md,
    borderWidth:1,borderColor:colors.border,marginBottom:SPACING.md,gap:SPACING.sm,
  },
  amountRow:{
    flexDirection:'row',alignItems:'center',
    borderWidth:1,borderColor:colors.border,borderRadius:10,
    paddingHorizontal:SPACING.sm,backgroundColor:colors.background,
  },
  amountPrefix:{fontSize:20,fontWeight:'700',color:colors.primary,marginRight:6},
  amountInput:{flex:1,fontSize:20,fontFamily:'Inter',color:colors.text,paddingVertical:10,outlineStyle:'none'},
  noteInput:{
    borderWidth:1,borderColor:colors.border,borderRadius:10,padding:SPACING.sm,
    fontFamily:'Inter',fontSize:14,color:colors.text,backgroundColor:colors.background,outlineStyle:'none',
  },
  saveButton:{backgroundColor:colors.primary,borderRadius:10,padding:SPACING.md,alignItems:'center'},
  saveButtonText:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:colors.onPrimary},
  helperText:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:4},

  historyCard:{
    backgroundColor:colors.white,borderRadius:14,padding:SPACING.md,
    borderWidth:1,borderColor:colors.border,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4,elevation:1,
  },
  historyTitle:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:colors.textSecondary,letterSpacing:1,textTransform:'uppercase',marginBottom:SPACING.sm,
  },
  txRow:{flexDirection:'row',alignItems:'flex-start',paddingVertical:8,borderTopWidth:1,borderTopColor:colors.border},
  txDot:{width:8,height:8,borderRadius:4,backgroundColor:colors.primary,marginTop:4,marginRight:10},
  txContent:{flex:1},
  txNote:{fontSize:13,fontWeight:'500',fontFamily:'Inter',color:colors.text},
  txDate:{fontSize:11,fontFamily:'Inter',color:colors.textSecondary,marginTop:1},
  txAmount:{fontSize:14,fontWeight:'700',fontFamily:'Inter',color:colors.primary},

  actionsRow:{flexDirection:'row',gap:SPACING.sm},
  editButton:{
    flex:1,borderWidth:1,borderColor:colors.border,borderRadius:12,
    padding:SPACING.md,alignItems:'center',backgroundColor:colors.white,
  },
  editButtonText:{fontSize:14,fontWeight:'600',fontFamily:'Inter',color:colors.text},
  deleteButton:{
    flex:1,backgroundColor:colors.dangerBg,borderRadius:12,
    padding:SPACING.md,alignItems:'center',borderWidth:1,borderColor:colors.dangerBorder,
  },
  deleteButtonText:{fontSize:14,fontWeight:'700',fontFamily:'Inter',color:colors.dangerText},
});

