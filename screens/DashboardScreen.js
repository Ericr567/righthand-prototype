import React, {useMemo} from 'react';
import {ScrollView, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';
import ProgressBar from '../components/ProgressBar';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getDueDate(due){
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), due);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, due);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function daysUntil(due){
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), due);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, due);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

export default function DashboardScreen({navigation, bills=[], autoSave={}}){
  const totalSaved  = bills.reduce((sum, b) => sum + (Number(b.saved) || 0), 0);
  const totalTarget = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const savingsProgress = totalTarget > 0 ? Math.min(1, totalSaved / totalTarget) : 0;
  const pct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return 'Good Morning';
    if (h >= 12 && h < 17) return 'Good Afternoon';
    if (h >= 17 && h < 21) return 'Good Evening';
    return 'Good Night';
  }, []);

  const upcomingBills = useMemo(() => {
    if (bills.length === 0) return [];
    const now = new Date();
    return [...bills]
      .sort((a, b) => {
        const ad = new Date(now.getFullYear(), now.getMonth(), a.due);
        const bd = new Date(now.getFullYear(), now.getMonth(), b.due);
        const aa = ad <= now ? new Date(now.getFullYear(), now.getMonth() + 1, a.due) : ad;
        const bb = bd <= now ? new Date(now.getFullYear(), now.getMonth() + 1, b.due) : bd;
        return aa - bb;
      })
      .slice(0, 3);
  }, [bills]);

  const nextBill = upcomingBills[0] || null;
  const nextSavingsAmount = nextBill
    ? Math.max(0, Math.round(Math.max(0, (nextBill.amount || 0) - (nextBill.saved || 0)) / 4))
    : 0;

  return (
    <ScrollView
      style={common.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Greeting ── */}
      <Text style={styles.greeting}>{greeting} 👋</Text>

      {/* ── Hero savings card ── */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Total Saved</Text>
        <Text style={styles.heroAmount}>${totalSaved.toLocaleString()}</Text>
        <Text style={styles.heroSub}>of ${totalTarget.toLocaleString()} total bills · {pct}% covered</Text>
        <View style={styles.heroBarWrap}>
          <View style={styles.heroBarTrack}>
            <View style={[styles.heroBarFill, {width: `${pct}%`}]} />
          </View>
        </View>
      </View>

      {/* ── Stats row ── */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, {marginRight: 8}]}>
          <Text style={styles.statNumber}>{bills.length}</Text>
          <Text style={styles.statLabel}>Bills tracked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {autoSave?.enabled
              ? (autoSave.amountType === 'percent' ? `${autoSave.amount}%` : `$${autoSave.amount}`)
              : `$${nextSavingsAmount}`}
          </Text>
          <Text style={styles.statLabel}>
            {autoSave?.enabled ? 'Auto saved / pay' : 'Next transfer est.'}
          </Text>
        </View>
      </View>

      {/* ── Upcoming bills ── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Upcoming Bills</Text>
        {upcomingBills.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bills yet — add one in the Bills tab.</Text>
          </View>
        ) : (
          upcomingBills.map((bill, i) => {
            const days = daysUntil(bill.due);
            const billPct = bill.amount > 0 ? Math.min(100, Math.round(((bill.saved||0) / bill.amount) * 100)) : 0;
            const urgent = days <= 5;
            return (
              <View key={bill.id} style={[styles.billRow, urgent && styles.billRowUrgent]}>
                <View style={styles.billLeft}>
                  <View style={[styles.billDot, {backgroundColor: urgent ? '#C62828' : COLORS.primary}]} />
                  <View>
                    <Text style={styles.billName}>{bill.name}</Text>
                    <Text style={styles.billMeta}>Due {getDueDate(bill.due)} · {bill.autoPay ? '⚡ Auto' : '✋ Manual'}</Text>
                  </View>
                </View>
                <View style={styles.billRight}>
                  <Text style={styles.billAmount}>${bill.amount}</Text>
                  <View style={styles.miniBadge}>
                    <Text style={[styles.miniBadgeText, {color: urgent ? '#C62828' : COLORS.primary}]}>
                      {days}d
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* ── Auto save status ── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Auto Save</Text>
        {autoSave?.enabled ? (
          <View style={styles.autoSaveCard}>
            <View style={styles.autoSaveLeft}>
              <Text style={styles.autoSaveAmount}>
                {autoSave.amountType === 'percent' ? `${autoSave.amount}%` : `$${autoSave.amount}`}
              </Text>
              <Text style={styles.autoSaveSub}>per {autoSave.frequency?.toLowerCase() || 'pay period'}</Text>
            </View>
            <View style={styles.autoSaveRight}>
              <View style={styles.activePill}><Text style={styles.activePillText}>Active</Text></View>
              {autoSave.nextPayDate ? (
                <Text style={styles.autoSaveDate}>Next: {autoSave.nextPayDate}</Text>
              ) : null}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.autoSavePrompt}
            onPress={() => navigation?.navigate && navigation.navigate('AutoSave')}
          >
            <Text style={styles.autoSavePromptText}>Set up Auto Save →</Text>
            <Text style={styles.autoSavePromptSub}>Automatically put money aside each paycheck.</Text>
          </TouchableOpacity>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding: SPACING.md, paddingBottom: 120},
  greeting:{
    fontSize:22,
    fontWeight:'700',
    fontFamily:'Inter',
    color:COLORS.text,
    marginBottom:SPACING.md,
  },

  /* Hero card */
  heroCard:{
    backgroundColor:COLORS.primary,
    borderRadius:18,
    padding:SPACING.lg,
    marginBottom:SPACING.md,
    shadowColor:'#000',
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.15,
    shadowRadius:12,
    elevation:4,
  },
  heroLabel:{fontSize:13,fontWeight:'600',fontFamily:'Inter',color:'rgba(255,255,255,0.7)',letterSpacing:1,textTransform:'uppercase',marginBottom:4},
  heroAmount:{fontSize:42,fontWeight:'800',fontFamily:'Inter',color:'#fff',marginBottom:2},
  heroSub:{fontSize:13,fontFamily:'Inter',color:'rgba(255,255,255,0.7)',marginBottom:SPACING.md},
  heroBarWrap:{marginTop:4},
  heroBarTrack:{height:6,backgroundColor:'rgba(255,255,255,0.25)',borderRadius:4,overflow:'hidden'},
  heroBarFill:{height:6,backgroundColor:'#fff',borderRadius:4},

  /* Stats row */
  statsRow:{flexDirection:'row',marginBottom:SPACING.md},
  statCard:{
    flex:1,
    backgroundColor:COLORS.white,
    borderRadius:14,
    padding:SPACING.md,
    borderWidth:1,
    borderColor:COLORS.border,
    alignItems:'center',
    shadowColor:'#000',
    shadowOffset:{width:0,height:2},
    shadowOpacity:0.05,
    shadowRadius:6,
    elevation:2,
  },
  statNumber:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:COLORS.primary},
  statLabel:{fontSize:12,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2,textAlign:'center'},

  /* Sections */
  section:{marginBottom:SPACING.md},
  sectionHeader:{
    fontSize:16,
    fontWeight:'700',
    fontFamily:'Inter',
    color:COLORS.text,
    marginBottom:SPACING.sm,
  },

  /* Bill rows */
  billRow:{
    backgroundColor:COLORS.white,
    borderRadius:12,
    padding:SPACING.md,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:8,
    borderWidth:1,
    borderColor:COLORS.border,
    shadowColor:'#000',
    shadowOffset:{width:0,height:1},
    shadowOpacity:0.04,
    shadowRadius:4,
    elevation:1,
  },
  billRowUrgent:{borderColor:'#F4C2C2',backgroundColor:'#FFFAFA'},
  billLeft:{flexDirection:'row',alignItems:'center',flex:1},
  billDot:{width:10,height:10,borderRadius:5,marginRight:10},
  billName:{fontSize:15,fontWeight:'600',fontFamily:'Inter',color:COLORS.text},
  billMeta:{fontSize:12,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2},
  billRight:{alignItems:'flex-end'},
  billAmount:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:COLORS.text},
  miniBadge:{marginTop:4,backgroundColor:COLORS.background,borderRadius:6,paddingHorizontal:6,paddingVertical:2},
  miniBadgeText:{fontSize:11,fontWeight:'700',fontFamily:'Inter'},

  /* Empty state */
  emptyCard:{backgroundColor:COLORS.white,borderRadius:12,padding:SPACING.md,borderWidth:1,borderColor:COLORS.border,alignItems:'center'},
  emptyText:{fontSize:14,fontFamily:'Inter',color:COLORS.textSecondary},

  /* Auto save */
  autoSaveCard:{
    backgroundColor:COLORS.white,
    borderRadius:12,
    padding:SPACING.md,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    borderWidth:1,
    borderColor:COLORS.border,
  },
  autoSaveLeft:{},
  autoSaveAmount:{fontSize:24,fontWeight:'800',fontFamily:'Inter',color:COLORS.primary},
  autoSaveSub:{fontSize:12,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2},
  autoSaveRight:{alignItems:'flex-end'},
  activePill:{backgroundColor:'#EAF6EC',borderRadius:20,paddingHorizontal:10,paddingVertical:4,marginBottom:4},
  activePillText:{fontSize:12,fontWeight:'700',fontFamily:'Inter',color:'#1F6A2E'},
  autoSaveDate:{fontSize:11,fontFamily:'Inter',color:COLORS.textSecondary},
  autoSavePrompt:{
    backgroundColor:COLORS.white,
    borderRadius:12,
    padding:SPACING.md,
    borderWidth:1.5,
    borderColor:COLORS.primary,
    borderStyle:'dashed',
  },
  autoSavePromptText:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:COLORS.primary},
  autoSavePromptSub:{fontSize:13,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:4},
});
