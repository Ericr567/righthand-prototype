import React from 'react';
import {ScrollView, View, Text, StyleSheet} from 'react-native';
import ProgressBar from '../components/ProgressBar';

import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';

export default function SavingsBreakdownScreen({bills = [], transactions = []}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const totalSaved  = bills.reduce((s, b) => s + (b.saved || 0), 0);
  const totalTarget = bills.reduce((s, b) => s + (b.amount || 0), 0);
  const totalPct    = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Savings Breakdown</Text>

      {/* Hero totals */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Saved</Text>
        <Text style={styles.heroAmount}>${totalSaved.toLocaleString()}</Text>
        <Text style={styles.heroSub}>of ${totalTarget.toLocaleString()} · {totalPct}% funded</Text>
        <View style={styles.heroBarTrack}>
          <View style={[styles.heroBarFill, {width:`${totalPct}%`}]} />
        </View>
      </View>

      {bills.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bills yet</Text>
          <Text style={styles.emptyBody}>Add bills to start tracking your savings progress.</Text>
        </View>
      )}

      {bills.map(b => {
        const saved   = b.saved || 0;
        const target  = b.amount || 1;
        const pct     = Math.min(100, Math.round((saved / target) * 100));
        const billTx  = transactions.filter(tx => tx.billId === b.id);
        const remaining = Math.max(0, target - saved);

        return (
          <View key={b.id} style={styles.billCard}>
            {/* Bill header */}
            <View style={styles.billHeader}>
              <View>
                <Text style={styles.billName}>{b.name}</Text>
                <Text style={styles.billFreq}>{b.frequency || 'Monthly'}</Text>
              </View>
              <View style={styles.billAmountCol}>
                <Text style={styles.billSaved}>${saved}</Text>
                <Text style={styles.billTarget}>of ${target}</Text>
              </View>
            </View>

            <View style={styles.progressWrap}>
              <ProgressBar progress={Math.min(1, saved / target)} />
              <View style={styles.progressMeta}>
                <Text style={styles.progressPct}>{pct}% funded</Text>
                {remaining > 0
                  ? <Text style={styles.progressRem}>${remaining} to go</Text>
                  : <View style={styles.fullPill}><Text style={styles.fullPillText}>Fully funded ✓</Text></View>
                }
              </View>
            </View>

            {/* Transaction history */}
            {billTx.length > 0 && (
              <View style={styles.txSection}>
                <Text style={styles.txHeader}>Recent transfers</Text>
                {[...billTx].reverse().slice(0, 5).map(tx => (
                  <View key={tx.id} style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txDate}>{tx.date}</Text>
                      <Text style={styles.txNote}>{tx.note}</Text>
                    </View>
                    <Text style={styles.txAmount}>+${tx.amount}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.text,marginBottom:SPACING.md},

  heroCard:{
    backgroundColor:colors.primary,
    borderRadius:18,padding:SPACING.lg,marginBottom:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.15,shadowRadius:12,elevation:4,
  },
  heroLabel:{fontSize:12,fontWeight:'600',fontFamily:'Inter',color:colors.onPrimaryMuted,letterSpacing:1,textTransform:'uppercase',marginBottom:4},
  heroAmount:{fontSize:40,fontWeight:'800',fontFamily:'Inter',color:colors.onPrimary,marginBottom:2},
  heroSub:{fontSize:13,fontFamily:'Inter',color:colors.onPrimaryMuted,marginBottom:SPACING.md},
  heroBarTrack:{height:6,backgroundColor:colors.onPrimaryMuted,borderRadius:4,overflow:'hidden'},
  heroBarFill:{height:6,backgroundColor:colors.onPrimary,borderRadius:4},

  emptyCard:{backgroundColor:colors.white,borderRadius:14,padding:SPACING.lg,borderWidth:1,borderColor:colors.border,alignItems:'center'},
  emptyTitle:{fontSize:16,fontWeight:'700',fontFamily:'Inter',color:colors.text,marginBottom:4},
  emptyBody:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary,textAlign:'center'},

  billCard:{
    backgroundColor:colors.white,
    borderRadius:16,padding:SPACING.md,marginBottom:SPACING.md,
    borderWidth:1,borderColor:colors.border,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  billHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:SPACING.sm},
  billName:{fontSize:16,fontWeight:'700',fontFamily:'Inter',color:colors.text},
  billFreq:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},
  billAmountCol:{alignItems:'flex-end'},
  billSaved:{fontSize:20,fontWeight:'800',fontFamily:'Inter',color:colors.primary},
  billTarget:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary},

  progressWrap:{marginBottom:SPACING.sm},
  progressMeta:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:4},
  progressPct:{fontSize:11,fontFamily:'Inter',color:colors.textSecondary},
  progressRem:{fontSize:11,fontFamily:'Inter',color:colors.textSecondary},
  fullPill:{backgroundColor:colors.successBg,borderRadius:20,paddingHorizontal:8,paddingVertical:2,borderWidth:1,borderColor:colors.successBorder},
  fullPillText:{fontSize:11,fontWeight:'600',fontFamily:'Inter',color:colors.successText},

  txSection:{borderTopWidth:1,borderTopColor:colors.border,paddingTop:SPACING.sm},
  txHeader:{fontSize:11,fontWeight:'700',fontFamily:'Inter',color:colors.textSecondary,letterSpacing:0.5,textTransform:'uppercase',marginBottom:6},
  txRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',paddingVertical:5},
  txLeft:{flex:1},
  txDate:{fontSize:12,fontWeight:'600',fontFamily:'Inter',color:colors.text},
  txNote:{fontSize:11,fontFamily:'Inter',color:colors.textSecondary,marginTop:1},
  txAmount:{fontSize:13,fontWeight:'700',fontFamily:'Inter',color:colors.primary},
});

