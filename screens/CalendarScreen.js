import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

export default function CalendarScreen({bills=[]}){
  // simple text list of upcoming bill due dates
  return (
    <View style={common.screen}>
      <Text style={common.title}>Calendar</Text>
      {bills.length > 0 ? (
        bills.map(b=> (
          <Text key={b.id} style={{marginTop:6}}>• {b.name} due on {b.due}th</Text>
        ))
      ) : (
        <Text style={{marginTop:SPACING.sm}}>No scheduled bills</Text>
      )}
      <Text style={{marginTop:SPACING.md,color:COLORS.textSecondary}}>Tap a date to view events (demo)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // calendar-specific custom styles could live here if needed
});
