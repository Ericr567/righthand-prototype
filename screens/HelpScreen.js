import React from 'react';
import {ScrollView, Text, View} from 'react-native';

import common, {SPACING} from '../styles/common';

export default function HelpScreen(){
  const faqs = [
    {q:'How does RightHand save money?', a:'RightHand automatically sets aside small amounts from your paycheck so you build up a buffer without thinking about it.'},
    {q:'How do automatic payments work?', a:'Your bills are paid automatically on the due date using the funds you’ve saved. You can always edit or cancel payments.'},
    {q:'What if a bill changes?', a:'If a bill amount changes, you’ll receive a notification and can adjust the scheduled payment or savings amount accordingly.'},
    {q:'How do I add or remove a bill?', a:'Go to the dashboard, tap "Add Bill" to create one. To remove an existing bill, open its details and choose delete.'},
    {q:'How secure is RightHand?', a:'We use industry-standard encryption and never store your bank credentials. All sensitive operations occur securely on trusted servers.'}
  ];

  return (
    <ScrollView style={common.screen}>
      <Text style={[common.title, common.titleBlock]}>Help Center</Text>
      {faqs.map((item,i)=>(
        <View key={i} style={{marginTop:SPACING.sm}}>
          <Text style={[common.body, common.question]}>• {item.q}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
