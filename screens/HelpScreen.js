import React, {useState} from 'react';
import {ScrollView, Text, View, TouchableOpacity, StyleSheet, Linking} from 'react-native';

import common, {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';

const FAQS = [
  {q:'How does RightHand automatically save for my bills?', a:'RightHand sets aside small amounts from each paycheck so your bill money is ready before due dates.'},
  {q:'When does RightHand move money into savings?', a:'Transfers are timed around your pay schedule and upcoming bills, so savings happen at the right moments.'},
  {q:'How is my savings amount calculated each pay period?', a:'We look at your upcoming bills and split the needed amount across your next paychecks.'},
  {q:'Can I skip a savings transfer if money is tight?', a:'Yes. You can pause or skip a transfer and turn it back on when you are ready.'},
  {q:'How do I turn auto-pay on or off for a specific bill?', a:'Go to Bills and use the Auto-Pay toggle on that bill card.'},
  {q:'What happens if my bill amount changes unexpectedly?', a:'You will get a reminder, then you can update the bill amount or adjust your schedule before it is due.'},
  {q:'Can I connect my bank later and still explore the app now?', a:'Yes. You can skip bank connection during setup and connect anytime from Settings.'},
  {q:'How do I add, edit, or remove a bill?', a:'Tap + Add New Bill to create one, or open Bill Details to edit or delete an existing bill.'},
  {q:'How do notifications work for upcoming bills and transfers?', a:'RightHand sends alerts for savings transfers, bill due dates, and payment updates.'},
  {q:'Can I get notifications sent to my phone, not just in-app?', a:'Yes. Turn on phone notifications in the Notifications screen to get device alerts.'},
  {q:'What should I do if a payment fails?', a:'Check your account balance and bill details, then retry payment or update the bill settings.'},
  {q:'Is my bank and personal information secure with RightHand?', a:'Yes. RightHand uses secure connections and industry-standard encryption to protect your data.'},
];

export default function HelpScreen({navigation}){
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(null);

  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.screenTitle}>Help Center</Text>
      <Text style={styles.screenSub}>Find answers to common questions below.</Text>

      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <View key={i} style={[styles.faqCard, isOpen && styles.faqCardOpen]}>
            <TouchableOpacity style={styles.faqHeader} onPress={() => setOpen(isOpen ? null : i)} activeOpacity={0.8}>
              <Text style={[styles.faqQuestion, isOpen && styles.faqQuestionOpen]}>{item.q}</Text>
              <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>{isOpen ? '−' : '+'}</Text>
            </TouchableOpacity>
            {isOpen && (
              <View style={styles.faqBody}>
                <Text style={styles.faqAnswer}>{item.a}</Text>
              </View>
            )}
          </View>
        );
      })}

      <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('https://example.com/help')} activeOpacity={0.8}>
        <View>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSub}>Visit our full Help Center</Text>
        </View>
        <Text style={styles.contactArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container:{padding:SPACING.md, paddingBottom:60},
  screenTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:colors.text,marginBottom:4},
  screenSub:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary,marginBottom:SPACING.md},

  faqCard:{
    backgroundColor:colors.white,
    borderRadius:14,marginBottom:8,
    borderWidth:1,borderColor:colors.border,
    overflow:'hidden',
    shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4,elevation:1,
  },
  faqCardOpen:{borderColor:colors.primary},

  faqHeader:{
    flexDirection:'row',alignItems:'center',justifyContent:'space-between',
    padding:SPACING.md,
  },
  faqQuestion:{
    flex:1,fontSize:14,fontWeight:'500',fontFamily:'Inter',color:colors.text,
    paddingRight:SPACING.sm,lineHeight:20,
  },
  faqQuestionOpen:{color:colors.primary,fontWeight:'600'},
  chevron:{
    fontSize:18,fontWeight:'700',fontFamily:'Inter',
    color:colors.border,width:22,textAlign:'center',
  },
  chevronOpen:{color:colors.primary},

  faqBody:{
    paddingHorizontal:SPACING.md,paddingBottom:SPACING.md,
    borderTopWidth:1,borderTopColor:colors.border,
    paddingTop:SPACING.sm,
  },
  faqAnswer:{fontSize:14,fontFamily:'Inter',color:colors.textSecondary,lineHeight:21},

  contactCard:{
    backgroundColor:colors.primary,
    borderRadius:16,padding:SPACING.lg,marginTop:SPACING.sm,
    flexDirection:'row',alignItems:'center',justifyContent:'space-between',
    shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.12,shadowRadius:10,elevation:3,
  },
  contactTitle:{fontSize:16,fontWeight:'700',fontFamily:'Inter',color:colors.onPrimary},
  contactSub:{fontSize:13,fontFamily:'Inter',color:colors.onPrimaryMuted,marginTop:2},
  contactArrow:{fontSize:22,color:colors.onPrimary,fontWeight:'300'},
});

