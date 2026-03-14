import React, {useMemo, useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput} from 'react-native';

import common, {SPACING, COLORS} from '../styles/common';

const BANKS = [
  {name:'Chase',         logo:'🏛️',  color:'#003087', accent:'#B9975B'},
  {name:'Bank of America',logo:'🏦', color:'#E31837', accent:'#012169'},
  {name:'Wells Fargo',   logo:'🐎',  color:'#D71E28', accent:'#FFCD41'},
  {name:'Capital One',   logo:'💳',  color:'#CC0000', accent:'#004977'},
  {name:'Citi',          logo:'🔵',  color:'#003B8E', accent:'#E31837'},
  {name:'US Bank',       logo:'🏦',  color:'#002776', accent:'#CC0000'},
  {name:'TD Bank',       logo:'🟢',  color:'#34A853', accent:'#1A1A1A'},
];

export default function BankConnectScreen({navigation}){
  const [query,       setQuery]       = useState('');
  const [selected,    setSelected]    = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [connecting,  setConnecting]  = useState(false);

  const filteredBanks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BANKS;
    return BANKS.filter((b) => b.name.toLowerCase().includes(q));
  }, [query]);

  function handleContinue() {
    setConnecting(true);
    setTimeout(() => { setConnecting(false); setShowSuccess(true); }, 1400);
    setTimeout(() => navigation.replace('Main'), 2200);
  }

  return (
    <View style={styles.root}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIconWrap}>
          <Text style={styles.heroIcon}>🔐</Text>
        </View>
        <Text style={styles.heroTitle}>Connect Your Bank</Text>
        <Text style={styles.heroSub}>256-bit encryption · read-only access · powered by Plaid</Text>

        <View style={styles.trustRow}>
          {['🔒 Secure','👁️ Read-only','⚡ Instant'].map((t) => (
            <View key={t} style={styles.trustPill}>
              <Text style={styles.trustPillText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          placeholder="Search 10,000+ banks…"
          placeholderTextColor={COLORS.textSecondary}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Bank list */}
      <ScrollView style={styles.listWrap} showsVerticalScrollIndicator={false}>
        <Text style={styles.listLabel}>POPULAR BANKS</Text>
        {filteredBanks.map((bank) => {
          const isSelected = selected?.name === bank.name;
          return (
            <TouchableOpacity
              key={bank.name}
              style={[styles.bankCard, isSelected && styles.bankCardSelected]}
              onPress={() => setSelected(bank)}
              activeOpacity={0.75}
            >
              <View style={[styles.bankLogoWrap, {backgroundColor: bank.color + '18'}]}>
                <Text style={styles.bankLogo}>{bank.logo}</Text>
              </View>
              <View style={styles.bankInfo}>
                <Text style={[styles.bankName, isSelected && styles.bankNameSelected]}>{bank.name}</Text>
                <Text style={styles.bankSub}>Personal &amp; Business</Text>
              </View>
              <View style={[styles.bankCheck, isSelected && styles.bankCheckActive]}>
                {isSelected && <Text style={styles.bankCheckMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        {filteredBanks.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏦</Text>
            <Text style={styles.emptyText}>No banks match "{query}"</Text>
            <Text style={styles.emptyCaption}>Try a different spelling</Text>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      {selected && !showSuccess && (
        <View style={styles.ctaCard}>
          <View style={styles.ctaRow}>
            <Text style={styles.ctaSelected}>
              <Text style={styles.ctaSelectedLabel}>Selected  </Text>
              {selected.logo} {selected.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.connectBtn, connecting && styles.connectBtnLoading]}
            onPress={handleContinue}
            disabled={connecting}
          >
            <Text style={styles.connectBtnText}>
              {connecting ? '🔄  Connecting…' : '🔒  Securely Connect'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Skip */}
      {!showSuccess && (
        <TouchableOpacity style={styles.skipWrap} onPress={() => navigation.replace('Main')}>
          <Text style={styles.skipText}>Skip for now — connect later in Settings</Text>
        </TouchableOpacity>
      )}

      {/* Success overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>Bank Connected!</Text>
            <Text style={styles.successSub}>{selected?.name} is linked securely</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:{flex:1,backgroundColor:COLORS.background},

  /* Hero */
  hero:{
    backgroundColor:COLORS.primary,
    paddingTop:SPACING.xl,paddingBottom:SPACING.lg,paddingHorizontal:SPACING.lg,
    alignItems:'center',
    borderBottomLeftRadius:28,borderBottomRightRadius:28,
  },
  heroIconWrap:{
    width:64,height:64,borderRadius:32,
    backgroundColor:'rgba(255,255,255,0.15)',
    alignItems:'center',justifyContent:'center',marginBottom:SPACING.sm,
    borderWidth:2,borderColor:'rgba(255,255,255,0.25)',
  },
  heroIcon:{fontSize:30},
  heroTitle:{fontSize:26,fontWeight:'800',fontFamily:'Inter',color:'#fff',marginBottom:4},
  heroSub:{fontSize:12,fontFamily:'Inter',color:'rgba(255,255,255,0.65)',textAlign:'center',marginBottom:SPACING.md},
  trustRow:{flexDirection:'row',gap:8},
  trustPill:{
    backgroundColor:'rgba(255,255,255,0.12)',borderWidth:1,
    borderColor:'rgba(255,255,255,0.2)',borderRadius:20,
    paddingHorizontal:10,paddingVertical:4,
  },
  trustPillText:{fontSize:11,fontWeight:'600',fontFamily:'Inter',color:'rgba(255,255,255,0.9)'},

  /* Search */
  searchRow:{
    flexDirection:'row',alignItems:'center',
    marginHorizontal:SPACING.md,marginTop:SPACING.md,
    backgroundColor:COLORS.white,borderRadius:14,
    borderWidth:1,borderColor:COLORS.border,
    paddingHorizontal:SPACING.sm,
    shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:6,elevation:2,
  },
  searchIcon:{fontSize:16,marginRight:6},
  searchInput:{flex:1,fontSize:15,fontFamily:'Inter',color:COLORS.text,paddingVertical:12,outlineStyle:'none'},

  /* List */
  listWrap:{flex:1,marginTop:SPACING.md,paddingHorizontal:SPACING.md},
  listLabel:{
    fontSize:11,fontWeight:'700',fontFamily:'Inter',
    color:COLORS.textSecondary,letterSpacing:1.2,textTransform:'uppercase',
    marginBottom:SPACING.sm,
  },
  bankCard:{
    flexDirection:'row',alignItems:'center',
    backgroundColor:COLORS.white,borderRadius:16,padding:14,
    marginBottom:10,borderWidth:1.5,borderColor:COLORS.border,
    shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.04,shadowRadius:4,elevation:1,
  },
  bankCardSelected:{
    borderColor:COLORS.primary,borderWidth:2,
    backgroundColor:'#F0F8F3',
    shadowColor:COLORS.primary,shadowOpacity:0.12,shadowRadius:8,elevation:3,
  },
  bankLogoWrap:{
    width:48,height:48,borderRadius:14,
    alignItems:'center',justifyContent:'center',marginRight:14,
  },
  bankLogo:{fontSize:24},
  bankInfo:{flex:1},
  bankName:{fontSize:15,fontWeight:'700',fontFamily:'Inter',color:COLORS.text},
  bankNameSelected:{color:COLORS.primary},
  bankSub:{fontSize:12,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:1},
  bankCheck:{
    width:24,height:24,borderRadius:12,
    borderWidth:1.5,borderColor:COLORS.border,
    alignItems:'center',justifyContent:'center',
  },
  bankCheckActive:{backgroundColor:COLORS.primary,borderColor:COLORS.primary},
  bankCheckMark:{fontSize:13,fontWeight:'800',color:'#fff'},

  /* Empty */
  emptyState:{alignItems:'center',paddingVertical:SPACING.xl},
  emptyIcon:{fontSize:40,marginBottom:SPACING.sm},
  emptyText:{fontSize:16,fontWeight:'600',fontFamily:'Inter',color:COLORS.text},
  emptyCaption:{fontSize:13,fontFamily:'Inter',color:COLORS.textSecondary,marginTop:4},

  /* CTA */
  ctaCard:{
    marginHorizontal:SPACING.md,marginBottom:SPACING.sm,
    backgroundColor:COLORS.white,borderRadius:18,padding:SPACING.md,
    borderWidth:1,borderColor:COLORS.border,
    shadowColor:'#000',shadowOffset:{width:0,height:-2},shadowOpacity:0.06,shadowRadius:8,elevation:4,
  },
  ctaRow:{marginBottom:SPACING.sm},
  ctaSelected:{fontSize:14,fontFamily:'Inter',color:COLORS.text,fontWeight:'600'},
  ctaSelectedLabel:{color:COLORS.textSecondary,fontWeight:'400'},
  connectBtn:{
    backgroundColor:COLORS.primary,borderRadius:14,
    paddingVertical:16,alignItems:'center',
    shadowColor:COLORS.primary,shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:8,elevation:4,
  },
  connectBtnLoading:{backgroundColor:COLORS.textSecondary,shadowOpacity:0},
  connectBtnText:{fontSize:16,fontWeight:'800',fontFamily:'Inter',color:'#fff',letterSpacing:0.3},

  /* Skip */
  skipWrap:{alignItems:'center',paddingVertical:12,marginBottom:4},
  skipText:{fontSize:12,fontFamily:'Inter',color:COLORS.textSecondary,textDecorationLine:'underline'},

  /* Success */
  successOverlay:{
    ...StyleSheet.absoluteFillObject,
    backgroundColor:'rgba(11,66,38,0.92)',
    alignItems:'center',justifyContent:'center',
  },
  successCard:{
    backgroundColor:COLORS.white,borderRadius:24,padding:SPACING.xl,
    alignItems:'center',width:'80%',
    shadowColor:'#000',shadowOffset:{width:0,height:8},shadowOpacity:0.2,shadowRadius:20,elevation:10,
  },
  successIcon:{fontSize:52,marginBottom:SPACING.sm},
  successTitle:{fontSize:22,fontWeight:'800',fontFamily:'Inter',color:COLORS.primary,marginBottom:6},
  successSub:{fontSize:14,fontFamily:'Inter',color:COLORS.textSecondary,textAlign:'center'},
});
