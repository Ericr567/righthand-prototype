import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput, Platform, ActivityIndicator, ScrollView, Linking} from 'react-native';

import {SPACING} from '../styles/common';
import {useAppTheme} from '../theme/ThemeContext';

export default function BankConnectScreen({navigation}) {
  const {colors} = useAppTheme();
  const styles = createStyles(colors);
  const [query, setQuery] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [linkReady, setLinkReady] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let cancelled = false;
    ensurePlaidScript()
      .then(() => {
        if (!cancelled) setLinkReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load Plaid Link. Refresh and try again.');
          setLinkReady(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const trimmed = query.trim();

    setSearching(true);
    setError('');

    const timer = setTimeout(async () => {
      try {
        const list = await searchInstitutions(trimmed);
        if (!cancelled) {
          setInstitutions(list);
          if (trimmed || list.length) setDropdownOpen(true);
        }
      } catch (searchError) {
        if (!cancelled) {
          setInstitutions([]);
          setError(searchError.message || 'Could not search institutions.');
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 280);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  async function handleContinue() {
    setError('');
    if (Platform.OS !== 'web') {
      setError('Plaid Link is currently enabled for web in this prototype.');
      return;
    }
    if (!selected) {
      setError('Select a bank from the dropdown first.');
      return;
    }

    setConnecting(true);
    setStatus('Creating secure link...');

    try {
      await ensurePlaidScript();
      const token = await createLinkToken();
      const plaid = global?.window?.Plaid;
      if (!plaid || typeof plaid.create !== 'function') {
        throw new Error('Plaid Link failed to initialize.');
      }

      const handler = plaid.create({
        token,
        onSuccess: async (publicToken, metadata) => {
          try {
            setStatus('Finalizing bank connection...');
            await exchangePublicToken(publicToken, metadata?.institution?.name || selected.name);
            setConnecting(false);
            setShowSuccess(true);
            setStatus('');
            setTimeout(() => navigation.replace('Main'), 1800);
          } catch (exchangeError) {
            setConnecting(false);
            setStatus('');
            setError(exchangeError.message || 'Could not finish connection. Try again.');
          }
        },
        onExit: (exitError) => {
          setConnecting(false);
          setStatus('');
          if (exitError) {
            setError('Plaid was closed before completion.');
          }
        },
      });

      setStatus('Opening Plaid...');
      handler.open();
    } catch (linkError) {
      setConnecting(false);
      setStatus('');
      setError(linkError.message || 'Unable to start Plaid Link.');
    }
  }

  async function handleSecureConnect() {
    await handleContinue();
  }

  const canSecureConnect = !connecting && !!selected && (Platform.OS !== 'web' || linkReady);

  async function handleVisitWebsite() {
    setError('');
    const url = normalizeUrl(selected?.login_url || selected?.url);
    if (!url) {
      setError('This institution did not provide a login URL.');
      return;
    }

    try {
      if (Platform.OS === 'web') {
        const win = global?.window;
        if (!win) throw new Error('Window is unavailable.');
        win.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error('Unable to open URL.');
      await Linking.openURL(url);
    } catch (visitError) {
      setError(visitError.message || 'Could not open the bank website.');
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.heroIconWrap}>
          <Text style={styles.heroIcon}>🔐</Text>
        </View>
        <Text style={styles.heroTitle}>Connect Your Bank</Text>
        <Text style={styles.heroSub}>256-bit encryption | read-only access | powered by Plaid</Text>
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.inputLabel}>Find your bank</Text>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            placeholder="Type your bank name"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={(val) => {
              setQuery(val);
              setSelected(null);
            }}
            style={styles.searchInput}
            clearButtonMode="while-editing"
            accessibilityLabel="Search bank"
          />
          {searching && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        <Text style={styles.helperText}>
          {query.trim().length === 0
            ? 'Popular banks are listed below. Type to refine your search.'
            : 'Select a bank from the dropdown list below.'}
        </Text>

        <View style={styles.dropdownWrap}>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setDropdownOpen((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel="Bank dropdown"
          >
            <Text style={[styles.dropdownText, !selected && styles.dropdownPlaceholder]}>
              {selected ? selected.name : 'Choose bank'}
            </Text>
            <Text style={styles.dropdownArrow}>{dropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              <ScrollView nestedScrollEnabled style={styles.dropdownScroll}>
                {institutions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelected(item);
                      setDropdownOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                    {!!(item.login_url || item.url) && (
                      <Text style={styles.dropdownItemSub}>Login: {formatDomain(item.login_url || item.url)}</Text>
                    )}
                  </TouchableOpacity>
                ))}
                {institutions.length === 0 && (
                  <View style={styles.dropdownEmpty}>
                    <Text style={styles.dropdownEmptyText}>No institutions found</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.connectBtn,
            !canSecureConnect && styles.connectBtnDisabled,
          ]}
          onPress={handleSecureConnect}
          disabled={!canSecureConnect}
          accessibilityRole="button"
          accessibilityLabel="Securely connect to Plaid"
        >
          <Text style={styles.connectBtnText}>
            {connecting ? 'Connecting to Plaid...' : 'Securely Connect to Plaid'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.secureNote}>This launches Plaid secure Link for encrypted bank connection.</Text>

        <TouchableOpacity
          style={[styles.websiteBtn, !selected && styles.connectBtnDisabled]}
          onPress={handleVisitWebsite}
          disabled={!selected}
          accessibilityRole="button"
          accessibilityLabel="Visit selected bank website"
        >
          <Text style={styles.websiteBtnText}>Open Bank Login Page</Text>
        </TouchableOpacity>

        {!!selected && <Text style={styles.selectedText}>Selected: {selected.name}</Text>}
        {connecting && (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.statusText}>{status || 'Working...'}</Text>
          </View>
        )}
        {!linkReady && Platform.OS === 'web' && !connecting && (
          <Text style={styles.helperText}>Loading Plaid Link...</Text>
        )}
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {!showSuccess && (
        <TouchableOpacity style={styles.skipWrap} onPress={() => navigation.replace('Main')}>
          <Text style={styles.skipText}>Skip for now and connect later</Text>
        </TouchableOpacity>
      )}

      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>Bank Connected!</Text>
            <Text style={styles.successSub}>{selected?.name} is linked securely.</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
  hero: {
    backgroundColor: colors.primary,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroIcon: {fontSize: 30},
  heroTitle: {fontSize: 26, fontWeight: '800', fontFamily: 'Inter', color: colors.onPrimary, marginBottom: 4},
  heroSub: {fontSize: 12, fontFamily: 'Inter', color: 'rgba(255,255,255,0.7)', textAlign: 'center'},

  contentCard: {
    margin: SPACING.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter',
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    backgroundColor: colors.background,
  },
  searchIcon: {fontSize: 15, marginRight: 6},
  searchInput: {flex: 1, fontSize: 15, fontFamily: 'Inter', color: colors.text, paddingVertical: 10, outlineStyle: 'none'},
  helperText: {fontSize: 12, fontFamily: 'Inter', color: colors.textSecondary, marginTop: 8},

  dropdownWrap: {marginTop: 12},
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {fontSize: 15, fontFamily: 'Inter', color: colors.text},
  dropdownPlaceholder: {color: colors.textSecondary},
  dropdownArrow: {fontSize: 12, color: colors.textSecondary},
  dropdownMenu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.white,
    maxHeight: 220,
    overflow: 'hidden',
  },
  dropdownScroll: {maxHeight: 220},
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {fontSize: 14, fontFamily: 'Inter', color: colors.text},
  dropdownItemSub: {fontSize: 11, fontFamily: 'Inter', color: colors.textSecondary, marginTop: 2},
  dropdownEmpty: {paddingVertical: 14, paddingHorizontal: SPACING.sm},
  dropdownEmptyText: {fontSize: 13, fontFamily: 'Inter', color: colors.textSecondary},

  connectBtn: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  connectBtnDisabled: {opacity: 0.6},
  connectBtnText: {fontSize: 15, fontWeight: '800', fontFamily: 'Inter', color: colors.onPrimary},
  secureNote: {fontSize: 11, fontFamily: 'Inter', color: colors.textSecondary, marginTop: 8, textAlign: 'center'},
  websiteBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  websiteBtnText: {fontSize: 14, fontWeight: '700', fontFamily: 'Inter', color: colors.text},
  selectedText: {fontSize: 12, fontFamily: 'Inter', color: colors.textSecondary, marginTop: 10},

  statusRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10},
  statusText: {fontSize: 12, fontFamily: 'Inter', color: colors.textSecondary},
  errorText: {fontSize: 12, fontFamily: 'Inter', color: colors.dangerText, marginTop: 10},

  skipWrap: {alignItems: 'center', paddingVertical: 12, marginBottom: 4},
  skipText: {fontSize: 12, fontFamily: 'Inter', color: colors.textSecondary, textDecorationLine: 'underline'},

  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,66,38,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: SPACING.xl,
    alignItems: 'center',
    width: '80%',
  },
  successIcon: {fontSize: 52, marginBottom: SPACING.sm},
  successTitle: {fontSize: 22, fontWeight: '800', fontFamily: 'Inter', color: colors.primary, marginBottom: 6},
  successSub: {fontSize: 14, fontFamily: 'Inter', color: colors.textSecondary, textAlign: 'center'},
});

let plaidScriptPromise = null;

function ensurePlaidScript() {
  if (Platform.OS !== 'web') return Promise.resolve();
  const win = global?.window;
  if (!win) return Promise.reject(new Error('Web window unavailable'));
  if (win.Plaid) return Promise.resolve();
  if (plaidScriptPromise) return plaidScriptPromise;

  plaidScriptPromise = new Promise((resolve, reject) => {
    const script = win.document.createElement('script');
    script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Plaid script'));
    win.document.body.appendChild(script);
  });

  return plaidScriptPromise;
}

async function searchInstitutions(query) {
  const q = (query || '').trim();
  const endpoint = q
    ? `/.netlify/functions/plaid-search-institutions?q=${encodeURIComponent(q)}`
    : '/.netlify/functions/plaid-search-institutions';
  const {res, data} = await fetchJson(endpoint);
  if (!res.ok || !Array.isArray(data.institutions)) {
    throw new Error(data.error || 'Unable to search institutions.');
  }
  return data.institutions;
}

function normalizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return `https://${raw}`;
}

function formatDomain(raw) {
  const url = normalizeUrl(raw);
  if (!url) return '';
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return raw;
  }
}

async function createLinkToken() {
  const {res, data} = await fetchJson('/.netlify/functions/plaid-create-link-token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({userId: `user-${Date.now()}`}),
  });
  if (!res.ok || !data.link_token) {
    throw new Error(data.error || 'Unable to create Plaid link token.');
  }
  return data.link_token;
}

async function exchangePublicToken(publicToken, institutionName) {
  const {res, data} = await fetchJson('/.netlify/functions/plaid-exchange-public-token', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({publicToken, institutionName}),
  });
  if (!res.ok || !data.ok) {
    throw new Error(data.error || 'Unable to exchange Plaid token.');
  }
  return data;
}

async function fetchJson(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw new Error('Unable to reach backend. Start with "npx netlify dev" and try again.');
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error('Backend returned an invalid response. Run using "npx netlify dev".');
  }

  return {res, data};
}
