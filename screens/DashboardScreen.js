import React, {useMemo} from 'react';
import {ScrollView, View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';
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

export default function DashboardScreen({navigation, bills = [], autoSave = {}}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const totalSaved  = bills.reduce((sum, b) => sum + (Number(b.saved) || 0), 0);
  const totalTarget = bills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
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

  const billInsights = useMemo(() => {
    return bills.map((bill) => {
      const amount = Number(bill.amount) || 0;
      const saved = Number(bill.saved) || 0;
      const remaining = Math.max(0, amount - saved);
      const days = daysUntil(bill.due);
      const coverage = amount > 0 ? Math.min(1, saved / amount) : 1;
      return {
        ...bill,
        amount,
        saved,
        remaining,
        days,
        coverage,
      };
    });
  }, [bills]);

  const certaintyScore = useMemo(() => {
    if (billInsights.length === 0) return 100;

    const weighted = billInsights.map((bill) => {
      const urgencyFactor = bill.days <= 3 ? 0.35 : bill.days <= 7 ? 0.6 : bill.days <= 14 ? 0.8 : 1;
      const certainty = (bill.coverage * 0.75) + (urgencyFactor * 0.25);
      return {
        weight: bill.amount > 0 ? bill.amount : 1,
        certainty,
      };
    });

    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
    const score = weighted.reduce((sum, item) => sum + (item.certainty * item.weight), 0) / (totalWeight || 1);
    return Math.max(0, Math.min(100, Math.round(score * 100)));
  }, [billInsights]);

  const certaintyTone = certaintyScore >= 85
    ? {label: 'Strong', color: colors.successText, bg: colors.successBg}
    : certaintyScore >= 65
      ? {label: 'Watch', color: colors.text, bg: colors.warningBg}
      : {label: 'At Risk', color: colors.dangerText, bg: colors.dangerBg};

  const riskAlerts = useMemo(() => {
    return billInsights
      .filter((bill) => bill.remaining > 0 && bill.days <= 10)
      .sort((a, b) => a.days - b.days)
      .slice(0, 3)
      .map((bill) => ({
        ...bill,
        dailyMove: Math.max(1, Math.ceil(bill.remaining / Math.max(1, bill.days))),
      }));
  }, [billInsights]);

  const paycheckPlan = useMemo(() => {
    const prioritized = [...billInsights]
      .filter((bill) => bill.remaining > 0)
      .sort((a, b) => a.days - b.days)
      .slice(0, 3);

    const basePool = autoSave?.enabled && autoSave.amountType === 'fixed'
      ? Math.max(0, Number(autoSave.amount) || 0)
      : nextSavingsAmount;

    if (prioritized.length === 0 || basePool <= 0) {
      return [];
    }

    const weighted = prioritized.map((bill) => ({
      ...bill,
      weight: bill.remaining / Math.max(1, bill.days + 2),
    }));
    const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);

    return weighted.map((bill) => {
      const raw = totalWeight > 0 ? (basePool * bill.weight) / totalWeight : 0;
      const suggested = Math.max(0, Math.min(bill.remaining, Math.round(raw)));
      return {
        ...bill,
        suggested,
      };
    });
  }, [billInsights, autoSave, nextSavingsAmount]);

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

      {/* ── Bill certainty score ── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Bill Certainty Score</Text>
        <View style={styles.certaintyCard}>
          <View>
            <Text style={styles.certaintyNumber}>{certaintyScore}</Text>
            <Text style={styles.certaintySub}>How safe your next 30 days look</Text>
          </View>
          <View style={[styles.certaintyPill, {backgroundColor: certaintyTone.bg}]}> 
            <Text style={[styles.certaintyPillText, {color: certaintyTone.color}]}>{certaintyTone.label}</Text>
          </View>
        </View>
      </View>

      {/* ── Miss-risk alerts ── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Miss-Risk Alerts</Text>
        {riskAlerts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No near-term bill risks detected.</Text>
          </View>
        ) : (
          riskAlerts.map((alert) => (
            <View key={alert.id} style={styles.riskCard}>
              <View style={styles.riskTopRow}>
                <Text style={styles.riskTitle}>{alert.name}</Text>
                <Text style={styles.riskDays}>{alert.days}d left</Text>
              </View>
              <Text style={styles.riskBody}>
                Short by ${alert.remaining}. Move about ${alert.dailyMove}/day to stay covered.
              </Text>
              <TouchableOpacity
                style={styles.riskButton}
                onPress={() => navigation?.navigate && navigation.navigate('BillDetails', {bill: alert})}
              >
                <Text style={styles.riskButtonText}>Plan Transfer</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* ── Paycheck plan ── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Paycheck Allocation Preview</Text>
        {paycheckPlan.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Add bills and set Auto Save to see a paycheck plan.</Text>
          </View>
        ) : (
          <View style={styles.planCard}>
            {paycheckPlan.map((item) => (
              <View key={`plan-${item.id}`} style={styles.planRow}>
                <Text style={styles.planName}>{item.name}</Text>
                <Text style={styles.planAmount}>${item.suggested}</Text>
              </View>
            ))}
            {autoSave?.enabled && autoSave.amountType === 'percent' ? (
              <Text style={styles.planHint}>Using {autoSave.amount}% per paycheck. Dollar amounts finalize when paycheck amount is known.</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* ── Upcoming bills ── */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Upcoming Bills</Text>
        {upcomingBills.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No bills yet — add one in the Bills tab.</Text>
          </View>
        ) : (
          upcomingBills.map((bill) => {
            const days = daysUntil(bill.due);
            const urgent = days <= 5;
            return (
              <View key={bill.id} style={[styles.billRow, urgent && styles.billRowUrgent]}>
                <View style={styles.billLeft}>
                  <View style={[styles.billDot, {backgroundColor: urgent ? '#C62828' : colors.primary}]} />
                  <View>
                    <Text style={styles.billName}>{bill.name}</Text>
                    <Text style={styles.billMeta}>Due {getDueDate(bill.due)} · {bill.autoPay ? '⚡ Auto' : '✋ Manual'}</Text>
                  </View>
                </View>
                <View style={styles.billRight}>
                  <Text style={styles.billAmount}>${bill.amount}</Text>
                  <View style={styles.miniBadge}>
                    <Text style={[styles.miniBadgeText, {color: urgent ? '#C62828' : colors.primary}]}>
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

const createStyles = (colors) => StyleSheet.create({
  container:{padding: SPACING.md, paddingBottom: 120},
  greeting:{
    fontSize:22,
    fontWeight:'700',
    fontFamily:'Inter',
    color:colors.text,
    marginBottom:SPACING.md,
  },

  /* Hero card */
  heroCard:{
    backgroundColor:colors.primary,
    borderRadius:18,
    padding:SPACING.lg,
    marginBottom:SPACING.md,
    shadowColor:'#000',
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.15,
    shadowRadius:12,
    elevation:4,
  },
  heroLabel:{fontSize:13,fontWeight:'600',fontFamily:'Inter',color:colors.onPrimaryMuted,letterSpacing:1,textTransform:'uppercase',marginBottom:4},
  heroAmount:{fontSize:42,fontWeight:'800',fontFamily:'Inter',color:colors.onPrimary,marginBottom:2},
  heroSub:{fontSize:13,fontFamily:'Inter',color:colors.onPrimaryMuted,marginBottom:SPACING.md},
  heroBarWrap:{marginTop:4},
  heroBarTrack:{height:6,backgroundColor:colors.onPrimaryMuted,borderRadius:4,overflow:'hidden'},
  heroBarFill:{height:6,backgroundColor:colors.onPrimary,borderRadius:4},

  /* Stats row */
  statsRow:{flexDirection:'row',marginBottom:SPACING.md},
  statCard:{
    flex:1,
    backgroundColor:colors.white,
    borderRadius:14,
    padding:SPACING.md,
    borderWidth:1,
    borderColor:colors.border,
    alignItems:'center',
    shadowColor:'#000',
    shadowOffset:{width:0,height:2},
    shadowOpacity:0.05,
    shadowRadius:6,
    elevation:2,
  },
  statNumber:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.primary},
  statLabel:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2,textAlign:'center'},

  /* Certainty */
  certaintyCard:{
    backgroundColor:colors.white,
    borderRadius:12,
    padding:SPACING.md,
    borderWidth:1,
    borderColor:colors.border,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
  },
  certaintyNumber:{fontSize:34,fontWeight:'800',fontFamily:'Inter',color:colors.primary,lineHeight:38},
  certaintySub:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},
  certaintyPill:{borderRadius:20,paddingHorizontal:10,paddingVertical:5},
  certaintyPillText:{fontSize:12,fontWeight:'700',fontFamily:'Inter'},

  /* Risk */
  riskCard:{
    backgroundColor:colors.dangerBg,
    borderRadius:12,
    padding:SPACING.md,
    borderWidth:1,
    borderColor:colors.dangerBorder,
    marginBottom:8,
  },
  riskTopRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  riskTitle:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:colors.dangerText},
  riskDays:{fontSize:12,fontWeight:'700',fontFamily:'Inter',color:colors.dangerText},
  riskBody:{fontSize:13,fontFamily:'Inter',color:colors.dangerText,marginTop:6,marginBottom:10},
  riskButton:{alignSelf:'flex-start',backgroundColor:colors.dangerText,borderRadius:8,paddingHorizontal:10,paddingVertical:6},
  riskButtonText:{fontSize:12,fontWeight:'700',fontFamily:'Inter',color:colors.onPrimary},

  /* Paycheck plan */
  planCard:{
    backgroundColor:colors.white,
    borderRadius:12,
    padding:SPACING.md,
    borderWidth:1,
    borderColor:colors.border,
  },
  planRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:6},
  planName:{fontSize:14,fontWeight:'600',fontFamily:'Inter',color:colors.text},
  planAmount:{fontSize:14,fontWeight:'700',fontFamily:'Inter',color:colors.primary},
  planHint:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:8},

  /* Sections */
  section:{marginBottom:SPACING.md},
  sectionHeader:{
    fontSize:16,
    fontWeight:'700',
    fontFamily:'Inter',
    color:colors.text,
    marginBottom:SPACING.sm,
  },

  /* Bill rows */
  billRow:{
    backgroundColor:colors.white,
    borderRadius:12,
    padding:SPACING.md,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:8,
    borderWidth:1,
    borderColor:colors.border,
    shadowColor:'#000',
    shadowOffset:{width:0,height:1},
    shadowOpacity:0.04,
    shadowRadius:4,
    elevation:1,
  },
  billRowUrgent:{borderColor:colors.dangerBorder,backgroundColor:colors.dangerBg},
  billLeft:{flexDirection:'row',alignItems:'center',flex:1},
  billDot:{width:10,height:10,borderRadius:5,marginRight:10},
  billName:{fontSize:15,fontWeight:'600',fontFamily:'Inter',color:colors.text},
  billMeta:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},
  billRight:{alignItems:'flex-end'},
  billAmount:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:colors.text},
  miniBadge:{marginTop:4,backgroundColor:colors.background,borderRadius:6,paddingHorizontal:6,paddingVertical:2},
  miniBadgeText:{fontSize:11,fontWeight:'700',fontFamily:'Inter'},

  /* Empty state */
  emptyCard:{backgroundColor:colors.white,borderRadius:12,padding:SPACING.md,borderWidth:1,borderColor:colors.border,alignItems:'center'},
  emptyText:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary},

  /* Auto save */
  autoSaveCard:{
    backgroundColor:colors.white,
    borderRadius:12,
    padding:SPACING.md,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    borderWidth:1,
    borderColor:colors.border,
  },
  autoSaveLeft:{},
  autoSaveAmount:{fontSize:24,fontWeight:'800',fontFamily:'Inter',color:colors.primary},
  autoSaveSub:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},
  autoSaveRight:{alignItems:'flex-end'},
  activePill:{backgroundColor:colors.successBg,borderRadius:20,paddingHorizontal:10,paddingVertical:4,marginBottom:4,borderWidth:1,borderColor:colors.successBorder},
  activePillText:{fontSize:12,fontWeight:'700',fontFamily:'Inter',color:colors.successText},
  autoSaveDate:{fontSize:11,fontFamily:'Inter',color:colors.textSecondary},
  autoSavePrompt:{
    backgroundColor:colors.white,
    borderRadius:12,
    padding:SPACING.md,
    borderWidth:1.5,
    borderColor:colors.primary,
    borderStyle:'dashed',
  },
  autoSavePromptText:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:colors.primary},
  autoSavePromptSub:{fontSize:13,fontFamily:'Inter',color:colors.textSecondary,marginTop:4},
});
