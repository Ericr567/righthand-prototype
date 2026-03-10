import React from 'react';
import {ScrollView, Text, StyleSheet, TouchableOpacity} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

export default function AutoPayScreen({bills=[]}){
  const [enabled, setEnabled] = React.useState(true);

  return (
    <ScrollView style={common.screen}>
      <Text style={[common.title, common.titleBlock]}>Auto-Pay Status</Text>
      <Text style={[common.sectionTitle, {marginTop:SPACING.sm}]}>Upcoming:</Text>
      <Text style={common.body}>Light Bill – $150 – Will be paid on 15th</Text>
      <Text style={[common.sectionTitle, {marginTop:SPACING.sm}]}>Last Payment:</Text>
      <Text style={common.body}>Phone Bill – $90 – Paid on 2nd</Text>

      <TouchableOpacity style={[styles.toggle, enabled ? styles.toggleOn : styles.toggleOff]} onPress={() => setEnabled((value) => !value)}>
        <Text style={styles.toggleText}>Auto-Pay {enabled ? 'On' : 'Off'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  toggle:{marginTop:SPACING.md,padding:SPACING.sm,borderRadius:8,alignItems:'center'},
  toggleOn:{backgroundColor:COLORS.successBg,borderWidth:1,borderColor:COLORS.successBorder},
  toggleOff:{backgroundColor:COLORS.subtleBg,borderWidth:1,borderColor:COLORS.border},
  toggleText:{fontWeight:'700'}
});
