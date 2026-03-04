import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export default function ProgressBar({progress=0,label,small}){
  return (
    <View style={{marginVertical:8}}>
      <View style={[styles.track, small && {height:8}]}> 
        <View style={[styles.fill,{width: `${Math.round(progress*100)}%`}]} />
      </View>
      {label && <Text style={{marginTop:6}}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  track:{height:12,backgroundColor:'#eee',borderRadius:6,overflow:'hidden'},
  fill:{height:12,backgroundColor:'#0a84ff'}
});
