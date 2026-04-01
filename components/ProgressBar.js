import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useAppTheme} from '../theme/ThemeContext';

export default function ProgressBar({progress=0,label,small,accessibilityLabel}){
  const {colors} = useAppTheme();
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const pct = Math.round(clampedProgress * 100);
  return (
    <View style={styles.container}>
      <View
        style={[styles.track, small && styles.trackSmall, {backgroundColor: colors.subtleBg}]}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityValue={{min:0, max:100, now:pct}}
        accessibilityLabel={accessibilityLabel || `${pct}% saved`}
      >
        <View style={[styles.fill, {width: `${pct}%`, backgroundColor: colors.primary}, small && styles.fillSmall]} />
      </View>
      {label && <Text style={[styles.label, {color: colors.textSecondary}]}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container:{marginVertical:8},
  track:{height:12,borderRadius:999,overflow:'hidden'},
  trackSmall:{height:8},
  fill:{height:12,borderRadius:999},
  fillSmall:{height:8},
  label:{marginTop:6,fontFamily:'Inter',fontSize:13,fontWeight:'400'},
});
