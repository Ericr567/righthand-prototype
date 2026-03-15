import React from 'react';
import {ScrollView, Text, StyleSheet, TouchableOpacity, View, Switch} from 'react-native';

import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';
import ProgressBar from '../components/ProgressBar';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getNextDueDate(dayOfMonth) {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function daysUntil(dayOfMonth) {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

export default function AutoPayScreen({navigation, bills = [], onToggleAutoPay}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const totalBills = bills.reduce((s, b) => s + (b.amount || 0), 0);
  const totalSaved = bills.reduce((s, b) => s + (b.saved || 0), 0);
  const autoCount  = bills.filter(b => b.autoPay).length;

  return (
    <ScrollView
      style={[common.screen, {backgroundColor: colors.background}]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.screenTitle}>Bills</Text>

      {/* Summary strip */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{bills.length}</Text>
          <Text style={styles.summaryLabel}>Bills</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>${totalBills.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Total / mo</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryNumber}>{autoCount}</Text>
          <Text style={styles.summaryLabel}>On auto-pay</Text>
        </View>
      </View>

      {bills.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bills yet</Text>
          <Text style={styles.emptyBody}>Add your first bill to start tracking and saving.</Text>
        </View>
      )}

      {bills.map((bill) => {
        const saved   = bill.saved || 0;
        const pct     = bill.amount > 0 ? Math.min(100, Math.round((saved / bill.amount) * 100)) : 0;
        const days    = daysUntil(bill.due);
        const urgent  = days <= 5;
        return (
          <TouchableOpacity
            key={bill.id}
            style={[styles.billCard, urgent && styles.billCardUrgent]}
            onPress={() => navigation.navigate('BillDetails', {bill})}
            activeOpacity={0.85}
          >
            {/* Top row */}
            <View style={styles.billTop}>
              <View style={styles.billTitleWrap}>
                <Text style={styles.billName}>{bill.name}</Text>
                <Text style={styles.billCompany}>{bill.company || bill.frequency}</Text>
              </View>
              <View style={styles.billAmountWrap}>
                <Text style={styles.billAmount}>${bill.amount}</Text>
                <View style={[styles.daysBadge, urgent && styles.daysBadgeUrgent]}>
                  <Text style={[styles.daysBadgeText, urgent && styles.daysBadgeTextUrgent]}>
                    {days}d · {getNextDueDate(bill.due)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress */}
            <View style={styles.progressWrap}>
              <ProgressBar progress={Math.min(1, saved / (bill.amount || 1))} />
              <Text style={styles.progressLabel}>${saved} saved · {pct}% of goal</Text>
            </View>

            {/* Bottom row */}
            <View style={styles.billBottom}>
              <Text style={styles.billBottomLabel}>Auto-Pay</Text>
              <Switch
                value={!!bill.autoPay}
                onValueChange={() => onToggleAutoPay && onToggleAutoPay(bill.id)}
                trackColor={{false: colors.border, true: colors.primary}}
                thumbColor={colors.white}
              />
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddBill')}>
        <Text style={styles.addButtonText}>+ Add New Bill</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:120},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.text,marginBottom:SPACING.md},

  summaryRow:{
    flexDirection:'row',
    backgroundColor:colors.white,
    borderRadius:14,
    borderWidth:1,
    borderColor:colors.border,
    marginBottom:SPACING.md,
    padding:SPACING.md,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  summaryItem:{flex:1,alignItems:'center'},
  summaryDivider:{width:1,backgroundColor:colors.border,marginVertical:4},
  summaryNumber:{fontSize:20,fontWeight:'800',fontFamily:'Inter',color:colors.primary},
  summaryLabel:{fontSize:11,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},

  emptyCard:{backgroundColor:colors.white,borderRadius:14,padding:SPACING.lg,borderWidth:1,borderColor:colors.border,alignItems:'center',marginBottom:SPACING.md},
  emptyTitle:{fontSize:16,fontWeight:'700',fontFamily:'Inter',color:colors.text,marginBottom:4},
  emptyBody:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary,textAlign:'center'},

  billCard:{
    backgroundColor:colors.white,
    borderRadius:16,
    padding:SPACING.md,
    marginBottom:SPACING.sm,
    borderWidth:1,
    borderColor:colors.border,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2,
  },
  billCardUrgent:{borderColor:colors.dangerBorder,backgroundColor:colors.dangerBg},

  billTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:SPACING.sm},
  billTitleWrap:{flex:1},
  billName:{fontSize:16,fontWeight:'700',fontFamily:'Inter',color:colors.text},
  billCompany:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},
  billAmountWrap:{alignItems:'flex-end'},
  billAmount:{fontSize:20,fontWeight:'800',fontFamily:'Inter',color:colors.text},
  daysBadge:{marginTop:4,backgroundColor:colors.background,borderRadius:8,paddingHorizontal:8,paddingVertical:3},
  daysBadgeUrgent:{backgroundColor:colors.dangerBg},
  daysBadgeText:{fontSize:11,fontWeight:'600',fontFamily:'Inter',color:colors.primary},
  daysBadgeTextUrgent:{color:colors.dangerText},

  progressWrap:{marginBottom:SPACING.sm},
  progressLabel:{fontSize:11,fontFamily:'Inter',color:colors.textSecondary,marginTop:4},

  billBottom:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',borderTopWidth:1,borderTopColor:colors.border,paddingTop:SPACING.sm},
  billBottomLabel:{fontSize:14,fontWeight:'600',fontFamily:'Inter',color:colors.text},

  addButton:{
    borderWidth:1.5,borderColor:colors.primary,borderRadius:14,
    padding:SPACING.md,alignItems:'center',
    borderStyle:'dashed',marginTop:SPACING.xs,
  },
  addButtonText:{color:colors.primary,fontWeight:'700',fontFamily:'Inter',fontSize:15},
});

