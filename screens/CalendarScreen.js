import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

export default function CalendarScreen({bills=[]}){
  const [selectedDate, setSelectedDate] = useState('15');
  const events = [
    {date: '2', type: 'Blue Dot', text: 'Paycheck Day', amount: '$2,400'},
    {date: '12', type: 'Green Dot', text: 'Savings Withdrawal Day', amount: '$38'},
    {date: '15', type: 'Red Dot', text: 'Bill Due & Pay Day', amount: '$150'}
  ];

  const selectedEvent = events.find((event) => event.date === selectedDate);

  return (
    <View style={common.screen}>
      <Text style={[common.title, common.titleBlock]}>Calendar</Text>

      <View style={styles.calendarBox}>
        <Text style={common.sectionTitle}>Calendar View</Text>
        <View style={styles.dateRow}>
          {events.map((event) => (
            <TouchableOpacity key={event.date} style={[styles.dateChip, selectedDate === event.date && styles.dateChipSelected]} onPress={() => setSelectedDate(event.date)}>
              <Text style={selectedDate === event.date ? styles.dateChipSelectedText : null}>{event.date}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{marginTop:SPACING.md}}>
        <Text style={common.body}>• Blue Dot – Paycheck Day</Text>
        <Text style={common.body}>• Green Dot – Savings Withdrawal Day</Text>
        <Text style={common.body}>• Red Dot – Bill Due & Pay Day</Text>
      </View>

      {selectedEvent && (
        <View style={styles.eventBox}>
          <Text style={common.sectionTitle}>What’s happening</Text>
          <Text style={common.body}>{selectedEvent.text}</Text>
          <Text style={[common.body, {marginTop:SPACING.xs}]}>Amount: {selectedEvent.amount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarBox:{marginTop:SPACING.md,borderWidth:1,borderColor:COLORS.border,borderRadius:10,padding:SPACING.sm},
  dateRow:{flexDirection:'row',gap:SPACING.xs},
  dateChip:{borderWidth:1,borderColor:COLORS.border,paddingHorizontal:SPACING.sm,paddingVertical:SPACING.xs,borderRadius:8},
  dateChipSelected:{borderColor:COLORS.primary,backgroundColor:COLORS.subtleBg},
  dateChipSelectedText:{color:COLORS.primary,fontWeight:'700'},
  eventBox:{marginTop:SPACING.md,borderWidth:1,borderColor:COLORS.border,borderRadius:10,padding:SPACING.sm},
});
