import 'react-native-gesture-handler';
import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from './screens/WelcomeScreen';
import SignupScreen from './screens/SignupScreen';
import BankConnectScreen from './screens/BankConnectScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddBillScreen from './screens/AddBillScreen';
import BillDetailsScreen from './screens/BillDetailsScreen';
import AddPaycheckScreen from './screens/AddPaycheckScreen';
import SavingsBreakdownScreen from './screens/SavingsBreakdownScreen';
import CalendarScreen from './screens/CalendarScreen';
import AutoPayScreen from './screens/AutoPayScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';
import HelpScreen from './screens/HelpScreen';
import AutoSaveScreen from './screens/AutoSaveScreen';
import ProfileScreen from './screens/ProfileScreen';
import SecurityScreen from './screens/SecurityScreen';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import BrandLogo from './components/BrandLogo';
import {BRANDING} from './assets/branding';
import {ThemeProvider, buildNavigationTheme, useAppTheme} from './theme/ThemeContext';
import {
  isSupabaseConfigured,
  getCurrentSession,
  subscribeToAuthChanges,
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
} from './services/supabase';
import {loadUserAppState, saveUserAppState} from './services/userDataApi';

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();
const APP_STATE_KEY = 'righthand_app_state_v1';

const TAB_ICONS = {Home:'🏠', Bills:'📋', Calendar:'📅', Bank:'🏦', Settings:'⚙️'};

export const AppStateContext = createContext({
  enrichedBills: [],
  autoSave: {enabled: false, amountType: 'fixed', amount: 0, frequency: 'Bi-weekly', nextPayDate: ''},
  toggleBillAutoPay: () => {},
  handleSignOut: () => {},
  plaidAccounts: [],
  plaidTransactions: [],
  onPlaidConnected: () => {},
});

function MainTabs() {
  const {enrichedBills, autoSave, toggleBillAutoPay, handleSignOut, plaidAccounts, plaidTransactions, onPlaidConnected} = useContext(AppStateContext);
  const {isDark, colors, mode, setMode} = useAppTheme();
  const shellBg = colors.background;

  return (
    <Tabs.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused}) => {
          const {Text} = require('react-native');
          return (
            <Text style={{fontSize: 20, opacity: focused ? 1 : 0.5}}>
              {TAB_ICONS[route.name]}
            </Text>
          );
        },
        tabBarLabel: route.name,
        tabBarActiveTintColor: isDark ? '#6FD09A' : '#0B4226',
        tabBarInactiveTintColor: isDark ? '#A6B8AE' : '#36454F',
        tabBarLabelStyle: {fontSize:11, fontFamily:'Inter', fontWeight:'600', marginBottom:2},
        tabBarStyle: {
          backgroundColor: shellBg,
          borderTopWidth:1,
          borderTopColor: isDark ? '#2A3A33' : '#9BB38C',
          paddingTop:6,
          height:62,
        },
      })}
    >
      <Tabs.Screen name="Home">
        {props => <DashboardScreen {...props} bills={enrichedBills} autoSave={autoSave} />}
      </Tabs.Screen>
      <Tabs.Screen name="Bills">{props => <AutoPayScreen {...props} bills={enrichedBills} onToggleAutoPay={toggleBillAutoPay} />}</Tabs.Screen>
      <Tabs.Screen name="Calendar">{props => <CalendarScreen {...props} bills={enrichedBills} />}</Tabs.Screen>
      <Tabs.Screen name="Bank">
        {props => <BankConnectScreen {...props} onPlaidConnected={onPlaidConnected} />}
      </Tabs.Screen>
      <Tabs.Screen name="Settings">
        {props => <SettingsScreen {...props} themeMode={mode} onThemeModeChange={setMode} onSignOut={handleSignOut} />}
      </Tabs.Screen>
    </Tabs.Navigator>
  );
}

export default function App(){
  const [bills, setBills] = useState([]);

  // Transaction history — this is the source of truth for how much has been saved per bill
  const [transactions, setTransactions] = useState([]);

  const [autoSave, setAutoSave] = useState({
    enabled: false,
    amountType: 'fixed',
    amount: 0,
    frequency: 'Bi-weekly',
    nextPayDate: '',
  });
  const [plaidAccounts, setPlaidAccounts] = useState([]);
  const [plaidTransactions, setPlaidTransactions] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [themeMode, setThemeMode] = useState('light');
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [backendReady, setBackendReady] = useState(false);
  const [authError, setAuthError] = useState('');

  const hasSupabase = isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      if (!hasSupabase) {
        if (mounted) setAuthReady(true);
        return;
      }

      const {session: currentSession, error} = await getCurrentSession();
      if (!mounted) return;
      if (error) {
        console.warn('Failed to load auth session', error.message);
      }
      setSession(currentSession || null);
      setAuthReady(true);
    }

    bootstrapAuth();

    const subscription = subscribeToAuthChanges((nextSession) => {
      if (!mounted) return;
      setSession(nextSession || null);
      setBackendReady(false);
      setAuthError('');
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe && subscription.unsubscribe();
    };
  }, [hasSupabase]);

  useEffect(() => {
    async function hydrateState() {
      try {
        const raw = await AsyncStorage.getItem(APP_STATE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.bills)) setBills(parsed.bills);
          if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
          if (parsed.autoSave && typeof parsed.autoSave === 'object') {
            setAutoSave((prev) => ({...prev, ...parsed.autoSave}));
          }
          if (parsed.themeMode === 'dark' || parsed.themeMode === 'light') {
            setThemeMode(parsed.themeMode);
          }
        }
      } catch (err) {
        console.warn('Failed to hydrate app state', err);
      } finally {
        setIsHydrated(true);
      }
    }

    hydrateState();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!authReady) return;

    let cancelled = false;

    async function persistState() {
      const payload = {bills, transactions, autoSave, themeMode};

      AsyncStorage.setItem(APP_STATE_KEY, JSON.stringify(payload)).catch((err) => {
        console.warn('Failed to persist app state', err);
      });

      if (session?.access_token && backendReady) {
        try {
          await saveUserAppState(session.access_token, payload);
        } catch (err) {
          if (!cancelled) {
            console.warn('Failed to sync user state to backend', err.message);
          }
        }
      }
    }

    persistState();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, authReady, backendReady, bills, transactions, autoSave, themeMode, session]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateFromBackend() {
      if (!authReady || !isHydrated) return;

      if (!session?.access_token) {
        if (!cancelled) setBackendReady(true);
        return;
      }

      try {
        const remoteState = await loadUserAppState(session.access_token);
        if (cancelled) return;

        if (remoteState && typeof remoteState === 'object') {
          if (Array.isArray(remoteState.bills)) setBills(remoteState.bills);
          if (Array.isArray(remoteState.transactions)) setTransactions(remoteState.transactions);
          if (remoteState.autoSave && typeof remoteState.autoSave === 'object') {
            setAutoSave((prev) => ({...prev, ...remoteState.autoSave}));
          }
          if (remoteState.themeMode === 'dark' || remoteState.themeMode === 'light') {
            setThemeMode(remoteState.themeMode);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Failed to hydrate user state from backend', err.message);
        }
      } finally {
        if (!cancelled) setBackendReady(true);
      }
    }

    hydrateFromBackend();

    return () => {
      cancelled = true;
    };
  }, [authReady, isHydrated, session]);

  async function handleSignUp(email, password) {
    try {
      setAuthError('');
      await signUpWithEmail(email, password);
      return {ok: true};
    } catch (err) {
      const message = err?.message || 'Unable to create account.';
      setAuthError(message);
      return {ok: false, error: message};
    }
  }

  async function handleSignIn(email, password) {
    try {
      setAuthError('');
      await signInWithEmail(email, password);
      return {ok: true};
    } catch (err) {
      const message = err?.message || 'Unable to sign in.';
      setAuthError(message);
      return {ok: false, error: message};
    }
  }

  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
    } catch (err) {
      console.warn('Failed to sign out', err.message);
    } finally {
      // Clear all local data regardless of whether sign-out succeeded
      setBills([]);
      setTransactions([]);
      setAutoSave({enabled:false, amountType:'fixed', amount:0, frequency:'Bi-weekly', nextPayDate:''});
      setPlaidAccounts([]);
      setPlaidTransactions([]);
      AsyncStorage.removeItem(APP_STATE_KEY).catch(() => {});
      AsyncStorage.removeItem('righthand_plaid_item_v1').catch(() => {});
    }
  }, []);

  const navTheme = useMemo(() => buildNavigationTheme(themeMode), [themeMode]);
  const isDark = themeMode === 'dark';
  const shellBg = isDark ? '#0F1412' : '#F5EEE3';
  const initialRouteName = session ? 'Main' : 'Welcome';

  if (!authReady) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: shellBg}}>
          <ActivityIndicator size="large" color={isDark ? '#6FD09A' : '#0B4226'} />
          <Text style={{marginTop: 12, color: isDark ? '#E8F3ED' : '#0B4226'}}>Loading your workspace...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  function updateAutoSave(config){ setAutoSave(config); }

  function addTransaction(tx){
    setTransactions(prev => [...prev, {...tx, id: Date.now()}]);
  }

  // Derive saved amount per bill from transaction history
  const savedByBill = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      acc[tx.billId] = (acc[tx.billId] || 0) + (Number(tx.amount) || 0);
      return acc;
    }, {});
  }, [transactions]);

  // Enrich bills with computed saved field
  const enrichedBills = useMemo(() =>
    bills.map(b => ({...b, saved: savedByBill[b.id] || 0})),
  [bills, savedByBill]);

  function addBill(b){
    setBills(prev=>[...prev,{...b,id:Date.now(),autoPay:b.autoPay ?? true}]);
  }
  function updateBill(updated){
    setBills(prev=>prev.map(b=>b.id===updated.id?{...b,...updated,autoPay:updated.autoPay ?? b.autoPay}:b));
  }
  function deleteBill(id){
    setBills(prev=>prev.filter(b=>b.id!==id));
    setTransactions(prev=>prev.filter(tx=>tx.billId!==id));
  }
  const toggleBillAutoPay = useCallback((id) => {
    setBills(prev => prev.map(bill => bill.id === id ? {...bill, autoPay: !bill.autoPay} : bill));
  }, []);

  const onPlaidConnected = useCallback(({itemId, accounts, transactions: plaidTxs}) => {
    if (Array.isArray(accounts)) setPlaidAccounts(accounts);
    if (Array.isArray(plaidTxs)) setPlaidTransactions(plaidTxs);
  }, []);

  const appStateValue = useMemo(() => ({
    enrichedBills,
    autoSave,
    toggleBillAutoPay,
    handleSignOut,
    plaidAccounts,
    plaidTransactions,
    onPlaidConnected,
  }), [enrichedBills, autoSave, toggleBillAutoPay, handleSignOut, plaidAccounts, plaidTransactions, onPlaidConnected]);

  return (
    <AppStateContext.Provider value={appStateValue}>
    <ThemeProvider mode={themeMode} setMode={setThemeMode}>
      <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor: shellBg}}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
            key={initialRouteName}
            initialRouteName={initialRouteName}
            screenOptions={{
              headerTitle: () => (
                <BrandLogo
                  size={28}
                  showWordmark={false}
                  imageSource={BRANDING.logoSource}
                  imageUri={BRANDING.logoUri}
                />
              ),
              headerStyle: {backgroundColor: shellBg},
              headerTintColor: isDark ? '#E8F3ED' : '#0B4226',
              headerTitleAlign: 'center',
            }}
          >
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{headerShown:false}} />
          <Stack.Screen name="Signup" options={{title:'Create Your Account'}}>
            {props => <SignupScreen
              {...props}
              onSignUp={handleSignUp}
              onSignIn={handleSignIn}
              hasSupabase={hasSupabase}
              authError={authError}
            />}
          </Stack.Screen>
          <Stack.Screen name="BankConnect">
            {props => <BankConnectScreen {...props} onPlaidConnected={onPlaidConnected} />}
          </Stack.Screen>

          <Stack.Screen name="Main" component={MainTabs} options={{headerShown:false}} />

          <Stack.Screen name="AddBill" options={{title:'Add a Bill'}}>
            {props => {
              const bill = props.route.params?.bill;
              const onSaveFunc = bill ? updateBill : addBill;
              return (
                <AddBillScreen
                  {...props}
                  onSave={(b)=>{
                    onSaveFunc(b);
                    if (bill) {
                      // After editing, reopen details by id so screen renders canonical state.
                      props.navigation.navigate('BillDetails', {billId: b.id});
                    } else {
                      props.navigation.navigate('Main');
                    }
                  }}
                />
              );
            }}
          </Stack.Screen>

          <Stack.Screen name="BillDetails" options={{title:'Bill Details'}}>
            {props => {
              const billId = props.route.params?.billId;
              const rawBill = props.route.params?.bill;
              const targetBill = billId
                ? enrichedBills.find((bill) => bill.id === billId)
                : (rawBill ? enrichedBills.find((bill) => bill.id === rawBill.id) || rawBill : null);
              const enriched = targetBill ? {...targetBill, saved: savedByBill[targetBill.id] || 0} : targetBill;
              const enrichedProps = {...props, route: {...props.route, params: {...props.route.params, bill: enriched}}};
              return <BillDetailsScreen
                {...enrichedProps}
                transactions={transactions.filter(tx => enriched && tx.billId === enriched.id)}
                onAddTransaction={addTransaction}
                onDelete={(id)=>{deleteBill(id); props.navigation.navigate('Main');}}
                onSave={updateBill}
              />;
            }}
          </Stack.Screen>

          <Stack.Screen name="AddPaycheck" options={{title:'Your Pay Schedule'}}>
            {props => <AddPaycheckScreen {...props} route={{...props.route, params: {
              ...props.route.params,
              paycheck: {frequency: autoSave.frequency, nextPayDate: autoSave.nextPayDate, amount: autoSave.amount},
              onSave: (config) => setAutoSave(prev => ({...prev, ...config})),
            }}} />}
          </Stack.Screen>
          <Stack.Screen name="AutoSave" options={{title:'Auto Save'}}>
            {props => <AutoSaveScreen {...props} route={{...props.route, params:{autoSave, onSave: updateAutoSave}}} />}
          </Stack.Screen>
          <Stack.Screen name="Savings" options={{title:'Savings Breakdown'}}>
            {props => <SavingsBreakdownScreen {...props} bills={enrichedBills} transactions={transactions} />}
          </Stack.Screen>
          <Stack.Screen name="Notifications">
            {props => <NotificationsScreen {...props} bills={enrichedBills} transactions={transactions} />}
          </Stack.Screen>
          <Stack.Screen name="Help" component={HelpScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{title:'Profile'}} />
          <Stack.Screen name="Security" component={SecurityScreen} options={{title:'Security & Password'}} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
    </ThemeProvider>
    </AppStateContext.Provider>
  );
}
