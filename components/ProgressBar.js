import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS} from '../styles/common';

export default function ProgressBar({progress=0,label,small,accessibilityLabel}){
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const pct = Math.round(clampedProgress * 100);
  return (
    <View style={styles.container}>
      <View
        style={[styles.track, small && styles.trackSmall]}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityValue={{min:0, max:100, now:pct}}
        accessibilityLabel={accessibilityLabel || `${pct}% saved`}
      >
        <View style={[styles.fill, {width: `${pct}%`}, small && styles.fillSmall]} />
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{marginVertical:8},
  track:{height:12,backgroundColor:'#DDE6DC',borderRadius:999,overflow:'hidden'},
  trackSmall:{height:8},
  fill:{height:12,backgroundColor:COLORS.primary,borderRadius:999},
  fillSmall:{height:8},
  label:{marginTop:6,color:COLORS.textSecondary,fontFamily:'Inter',fontSize:13,fontWeight:'400'}
});
