import React, {useMemo, useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS_OF_WEEK = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function getNextDueDate(day) {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), day);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function daysUntil(day) {
  const now = new Date();
  let d = new Date(now.getFullYear(), now.getMonth(), day);
  if (d <= now) d = new Date(now.getFullYear(), now.getMonth() + 1, day);
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

export default function CalendarScreen({bills=[]}){
  const [viewMode, setViewMode] = useState('calendar');

  const events = useMemo(() => {
    return bills
      .map((bill) => {
        const remaining = Math.max(0, (Number(bill.amount) || 0) - (Number(bill.saved) || 0));
        return {
          date: String(bill.due || 1),
          billName: bill.name,
          amount: bill.amount || 0,
          saved: bill.saved || 0,
          autoPay: !!bill.autoPay,
          savingsEach: Math.round(remaining / 4),
          id: bill.id,
        };
      })
      .sort((a, b) => Number(a.date) - Number(b.date));
  }, [bills]);

  const [selectedDate, setSelectedDate] = useState(events[0]?.date || '1');

  useEffect(() => {
    if (events.length > 0 && !events.some(e => e.date === selectedDate)) {
      setSelectedDate(events[0].date);
    }
  }, [events, selectedDate]);

  const selectedEvent = events.find(e => e.date === selectedDate);

  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Calendar</Text>

      {/* View mode toggle */}
      <View style={styles.segmentRow}>
        {['calendar','list'].map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.segment, viewMode === mode && styles.segmentActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={viewMode === mode ? styles.segmentTextActive : styles.segmentText}>
              {mode === 'calendar' ? '📅  Calendar' : '📋  List'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {bills.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bills yet</Text>
          <Text style={styles.emptyBody}>Add bills in the Bills tab to populate your calendar.</Text>
        </View>
      ) : viewMode === 'calendar' ? (
        <>
          {/* Date chip grid */}
          <View style={styles.chipGrid}>
            {events.map((event, i) => {
              const urgent = daysUntil(Number(event.date)) <= 5;
              const active = selectedDate === event.date;
              return (
                <TouchableOpacity
                  key={`${event.date}-${i}`}
                  style={[styles.chip, active && styles.chipActive, urgent && !active && styles.chipUrgent]}
                  onPress={() => setSelectedDate(event.date)}
                >
                  <Text style={[styles.chipDay, active && styles.chipDayActive, urgent && !active && styles.chipDayUrgent]}>
                    {event.date}
                  </Text>
                  <Text style={[styles.chipSub, active && {color:'rgba(255,255,255,0.8)'}]}>
                    {MONTHS[new Date(new Date().getFullYear(), new Date().getMonth(), Number(event.date)).getMonth()]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Detail card */}
          {selectedEvent && (
            <View style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View>
                  <Text style={styles.detailBillName}>{selectedEvent.billName}</Text>
                  <Text style={styles.detailDue}>Due {getNextDueDate(Number(selectedEvent.date))} · {daysUntil(Number(selectedEvent.date))} days away</Text>
                </View>
                <View style={[styles.pill, selectedEvent.autoPay ? styles.pillGreen : styles.pillGray]}>
                  <Text style={[styles.pillText, selectedEvent.autoPay ? styles.pillTextGreen : styles.pillTextGray]}>
                    {selectedEvent.autoPay ? '⚡ Auto' : '✋ Manual'}
                  </Text>
                </View>
              </View>
              <View style={styles.detailStats}>
                <View style={styles.detailStat}>
                  <Text style={styles.detailStatNumber}>${selectedEvent.amount}</Text>
                  <Text style={styles.detailStatLabel}>Total due</Text>
                </View>
                <View style={styles.detailStatDivider} />
                <View style={styles.detailStat}>
                  <Text style={styles.detailStatNumber}>${selectedEvent.saved}</Text>
                  <Text style={styles.detailStatLabel}>Saved</Text>
                </View>
                <View style={styles.detailStatDivider} />
                <View style={styles.detailStat}>
                  <Text style={styles.detailStatNumber}>${selectedEvent.savingsEach}</Text>
                  <Text style={styles.detailStatLabel}>/ paycheck</Text>
                </View>
              </View>
            </View>
          )}
        </>
      ) : (
        /* List view */
        events.map((event, i) => {
          const days = daysUntil(Number(event.date));
          const urgent = days <= 5;
          return (
            <View key={`${event.date}-${i}`} style={[styles.listRow, urgent && styles.listRowUrgent]}>
              <View style={styles.listLeft}>
                <View style={styles.listDateBadge}>
                  <Text style={styles.listDateDay}>{event.date}</Text>
                  <Text style={styles.listDateMon}>{getNextDueDate(Number(event.date)).split(' ')[0]}</Text>
                </View>
                <View>
                  <Text style={styles.listBillName}>{event.billName}</Text>
                  <Text style={styles.listMeta}>{event.autoPay ? '⚡ Auto-Pay' : '✋ Manual'} · ${event.saved} saved</Text>
                </View>
              </View>
              <View style={styles.listRight}>
                <Text style={styles.listAmount}>${event.amount}</Text>
                <Text style={[styles.listDays, urgent && {color:'#C62828'}]}>{days}d</Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:120},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:COLORS.text,marginBottom:SPACING.md},

  segmentRow:{
    flexDirection:'row',
    backgroundColor:COLORS.white,
    borderRadius:12,
    borderWidth:1,
    borderColor:COLORS.border,
    padding:4,
    marginBottom:SPACING.md,
  },
  segment:{flex:1,paddingVertical:8,alignItems:'center',borderRadius:10},
  segmentActive:{backgroundColor:COLORS.primary},
  segmentText:{fontSize:14,fontFamily:'Inter',fontWeight:'600',color:COLORS.textSecondary},
  segmentTextActive:{fontSize:14,fontFamily:'Inter',fontWeight:'700',color:COLORS.white},

  emptyCard:{backgroundColor:COLORS.white,borderRadius:14,padding:SPACING.lg,borderWidth:1,borderColor:COLORS.border,alignItems:'center'},
  emptyTitle:{fontSize:16,fontWeight:'700',fontFamily:'Inter',color:COLORS.text,marginBottom:4},
  emptyBody:{fontSize:14,fontFamily:'Inter',color:COLORS.textSecondary,textAlign:'center'},

  chipGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:SPACING.md},
  chip:{width:60,paddingVertical:10,borderRadius:12,borderWidth:1,borderColor:COLORS.border,backgroundColor:COLORS.white,alignItems:'center'},
  chipActive:{backgroundColor:COLORS.primary,borderColor:COLORS.primary},
  chipUrgent:{borderColor:'#F4C2C2',backgroundColor:'#FFFAFA'},
  chipDay:{fontSize:18,fontWeight:'800',fontFamily:'Inter',color:COLORS.text},
  chipDayActive:{color:COLORS.white},
  chipDayUrgent:{color:'#C62828'},
  chipSub:{fontSize:10,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2},

  detailCard:{
    backgroundColor:COLORS.white,
    borderRadius:16,
    padding:SPACING.md,
    borderWidth:1,
    borderColor:COLORS.border,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8,elevation:2,
  },
  detailHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:SPACING.md},
  detailBillName:{fontSize:18,fontWeight:'700',fontFamily:'Inter',color:COLORS.text},
  detailDue:{fontSize:12,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2},
  pill:{borderRadius:20,paddingHorizontal:10,paddingVertical:4,borderWidth:1},
  pillGreen:{backgroundColor:COLORS.successBg,borderColor:COLORS.successBorder},
  pillGray:{backgroundColor:COLORS.subtleBg,borderColor:COLORS.border},
  pillText:{fontSize:12,fontWeight:'600',fontFamily:'Inter'},
  pillTextGreen:{color:COLORS.successText},
  pillTextGray:{color:COLORS.textSecondary},
  detailStats:{flexDirection:'row'},
  detailStat:{flex:1,alignItems:'center'},
  detailStatDivider:{width:1,backgroundColor:COLORS.border,marginVertical:4},
  detailStatNumber:{fontSize:20,fontWeight:'800',fontFamily:'Inter',color:COLORS.primary},
  detailStatLabel:{fontSize:11,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2},

  listRow:{
    backgroundColor:COLORS.white,
    borderRadius:14,
    padding:SPACING.md,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    marginBottom:8,
    borderWidth:1,
    borderColor:COLORS.border,
    shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4,elevation:1,
  },
  listRowUrgent:{borderColor:'#F4C2C2',backgroundColor:'#FFFAFA'},
  listLeft:{flexDirection:'row',alignItems:'center',flex:1},
  listDateBadge:{
    width:44,height:44,borderRadius:10,
    backgroundColor:COLORS.background,borderWidth:1,borderColor:COLORS.border,
    alignItems:'center',justifyContent:'center',marginRight:12,
  },
  listDateDay:{fontSize:16,fontWeight:'800',fontFamily:'Inter',color:COLORS.primary},
  listDateMon:{fontSize:9,fontFamily:'Inter',color:COLORS.textSecondary},
  listBillName:{fontSize:15,fontWeight:'600',fontFamily:'Inter',color:COLORS.text},
  listMeta:{fontSize:12,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:2},
  listRight:{alignItems:'flex-end'},
  listAmount:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:COLORS.text},
  listDays:{fontSize:11,fontFamily:'Inter',color:COLORS.primary,fontWeight:'600',marginTop:2},
});
