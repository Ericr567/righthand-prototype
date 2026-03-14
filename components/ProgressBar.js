import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS} from '../styles/common';

export default function ProgressBar({progress=0,label,small}){
  const clampedProgress = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.container}>
      <View style={[styles.track, small && styles.trackSmall]}>
        <View style={[styles.fill, {width: `${Math.round(clampedProgress * 100)}%`}, small && styles.fillSmall]} />
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
