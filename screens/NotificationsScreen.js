import React from 'react';
import {ScrollView, Text, View, TouchableOpacity, StyleSheet} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

export default function NotificationsScreen(){
  const [notes,setNotes] = React.useState([
    "$38 saved from your paycheck today",
    "Rent will be paid in 2 days",
    "Internet bill amount changed - review needed",
    "Payment successful: Light Bill"
  ]);
  return (
    <ScrollView style={common.screen}>
      <Text style={common.title}>Notifications</Text>
      {notes.map((n,i)=>(<View key={i} style={styles.note}><Text>{n}</Text></View>))}
      {notes.length > 0 && (
        <TouchableOpacity style={styles.button} onPress={()=>setNotes([])}><Text>Mark All as Read</Text></TouchableOpacity>
      )}
      {notes.length === 0 && <Text style={{marginTop:SPACING.md,color:COLORS.textSecondary}}>No new notifications</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  note:{padding:SPACING.sm,backgroundColor:COLORS.background,borderRadius:8,marginVertical:SPACING.xs,borderWidth:1,borderColor:COLORS.border},
  button:{backgroundColor:COLORS.border,padding:SPACING.sm,borderRadius:8,marginTop:SPACING.md,alignItems:'center'}
});
