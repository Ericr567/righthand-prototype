import React from 'react';
import {ScrollView, Text, StyleSheet} from 'react-native';

import common, {SPACING} from '../styles/common';

export default function AutoPayScreen({bills=[]}){
  return (
    <ScrollView style={common.screen}>
      <Text style={common.title}>Auto-Pay Status</Text>
      <Text style={{marginTop:SPACING.sm, fontWeight:'600'}}>Upcoming:</Text>
      <Text>Light Bill – $150 – Will be paid on 15th</Text>
      <Text style={{marginTop:SPACING.sm, fontWeight:'600'}}>Last Payment:</Text>
      <Text>Phone Bill – $90 – Paid on 2nd</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // no additional styles required currently
});
