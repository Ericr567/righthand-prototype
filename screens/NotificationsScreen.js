import React from 'react';
import {ScrollView, Text, View, TouchableOpacity, StyleSheet, Switch} from 'react-native';

import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';

export default function NotificationsScreen({bills = []}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const [inApp,  setInApp]  = React.useState(true);
  const [phone,  setPhone]  = React.useState(false);

  const initialNotes = React.useMemo(() => {
    const now = new Date();
    const alerts = [];
    bills.forEach((bill) => {
      const amount = Number(bill.amount) || 0;
      const saved = Number(bill.saved) || 0;
      const remaining = Math.max(0, amount - saved);
      const due = Number(bill.due) || 1;
      let dueDate = new Date(now.getFullYear(), now.getMonth(), due);
      if (dueDate <= now) dueDate = new Date(now.getFullYear(), now.getMonth() + 1, due);
      const daysAway = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      if (remaining === 0 && amount > 0) {
        alerts.push({id:`${bill.id}-funded`, type:'savings', text:`${bill.name} is fully funded — $${amount} ready for the due date!`});
      } else if (daysAway <= 3 && remaining > 0) {
        alerts.push({id:`${bill.id}-urgent`, type:'due', text:`${bill.name} due in ${daysAway} day${daysAway === 1 ? '' : 's'} — $${remaining} still needed.`});
      } else if (daysAway <= 7 && remaining > 0) {
        alerts.push({id:`${bill.id}-week`, type:'status', text:`${bill.name} due in ${daysAway} days — $${remaining} remaining to fund.`});
      }
    });
    if (alerts.length === 0 && bills.length > 0) {
      alerts.push({id:'all-ok', type:'savings', text:'All bills are on track — no actions needed right now.'});
    }
    return alerts;
  }, [bills]);

  const [notes, setNotes] = React.useState(initialNotes);
  React.useEffect(() => { setNotes(initialNotes); }, [initialNotes]);

  const unread = notes.length;

  const typeIcon  = {savings:'💰', due:'📅', status:'⚡'};
  const typeColor = {savings:colors.successBg, due:colors.infoBg, status:colors.warningBg};
  const typeBorder= {savings:colors.successBorder, due:colors.infoBorder, status:colors.warningBorder};

  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Notifications</Text>
        {unread > 0 && (
          <View style={styles.badge}><Text style={styles.badgeText}>{unread}</Text></View>
        )}
      </View>

      {/* Delivery preferences */}
      <View style={styles.prefCard}>
        <Text style={styles.prefTitle}>Delivery Preferences</Text>
        <View style={styles.prefRow}>
          <View>
            <Text style={styles.prefLabel}>In-app notifications</Text>
            <Text style={styles.prefSub}>Alerts inside RightHand</Text>
          </View>
          <Switch
            value={inApp}
            onValueChange={setInApp}
            trackColor={{false:colors.border, true:colors.primary}}
            thumbColor={colors.white}
          />
        </View>
        <View style={[styles.prefRow, {borderTopWidth:1, borderTopColor:colors.border}]}>
          <View>
            <Text style={styles.prefLabel}>Phone notifications</Text>
            <Text style={styles.prefSub}>Push alerts on your device</Text>
          </View>
          <Switch
            value={phone}
            onValueChange={setPhone}
            trackColor={{false:colors.border, true:colors.primary}}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Notification items */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Recent Activity</Text>
        {notes.length > 0 && (
          <TouchableOpacity onPress={() => setNotes([])}>
            <Text style={styles.markRead}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyBody}>No new notifications right now.</Text>
        </View>
      ) : (
        notes.map((n, i) => (
          <View key={n.id || i} style={[styles.noteCard, {backgroundColor: typeColor[n.type] || colors.white, borderColor: typeBorder[n.type] || colors.border}]}>
            <Text style={styles.noteIcon}>{typeIcon[n.type] || '🔔'}</Text>
            <Text style={styles.noteText}>{n.text}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},

  headerRow:{flexDirection:'row',alignItems:'center',marginBottom:SPACING.md},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.text},
  badge:{
    marginLeft:10,backgroundColor:colors.primary,borderRadius:12,
    paddingHorizontal:8,paddingVertical:2,
  },
  badgeText:{fontSize:12,fontWeight:'700',fontFamily:'Inter',color:colors.white},

  prefCard:{
    backgroundColor:colors.white,
    borderRadius:16,
    borderWidth:1,
    borderColor:colors.border,
    marginBottom:SPACING.md,
    overflow:'hidden',
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6,elevation:2,
  },
  prefTitle:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:colors.textSecondary,letterSpacing:1,textTransform:'uppercase',
    paddingHorizontal:SPACING.md,paddingTop:SPACING.sm,paddingBottom:4,
  },
  prefRow:{
    flexDirection:'row',alignItems:'center',justifyContent:'space-between',
    paddingHorizontal:SPACING.md,paddingVertical:14,
  },
  prefLabel:{fontSize:15,fontWeight:'500',fontFamily:'Inter',color:colors.text},
  prefSub:{fontSize:12,fontFamily:'Inter',color:colors.textSecondary,marginTop:2},

  listHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:SPACING.sm},
  listTitle:{fontSize:16,fontWeight:'700',fontFamily:'Inter',color:colors.text},
  markRead:{fontSize:13,fontFamily:'Inter',color:colors.primary,fontWeight:'600'},

  emptyCard:{backgroundColor:colors.white,borderRadius:14,padding:SPACING.lg,borderWidth:1,borderColor:colors.border,alignItems:'center'},
  emptyTitle:{fontSize:16,fontWeight:'700',fontFamily:'Inter',color:colors.text,marginBottom:4},
  emptyBody:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary},

  noteCard:{
    flexDirection:'row',alignItems:'flex-start',
    borderRadius:12,padding:SPACING.md,
    marginBottom:8,borderWidth:1,
  },
  noteIcon:{fontSize:18,marginRight:10,marginTop:1},
  noteText:{flex:1,fontSize:14,fontFamily:'Inter',color:colors.text,lineHeight:20},
});

