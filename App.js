import 'react-native-gesture-handler';
import React, {useEffect, useMemo, useState} from 'react';
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
import {ThemeProvider, buildNavigationTheme} from './theme/ThemeContext';

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();
const APP_STATE_KEY = 'righthand_app_state_v1';

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
  const [isHydrated, setIsHydrated] = useState(false);
  const [themeMode, setThemeMode] = useState('light');

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

    AsyncStorage.setItem(
      APP_STATE_KEY,
      JSON.stringify({bills, transactions, autoSave, themeMode}),
    ).catch((err) => {
      console.warn('Failed to persist app state', err);
    });
  }, [isHydrated, bills, transactions, autoSave, themeMode]);

  const navTheme = useMemo(() => buildNavigationTheme(themeMode), [themeMode]);
  const isDark = themeMode === 'dark';
  const shellBg = isDark ? '#0F1412' : '#F5EEE3';

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
  function toggleBillAutoPay(id){
    setBills(prev => prev.map(bill => bill.id === id ? {...bill, autoPay: !bill.autoPay} : bill));
  }

  const tabIcons = {Home:'🏠', Bills:'📋', Calendar:'📅', Bank:'🏦', Settings:'⚙️'};

  function MainTabs(){
    return (
      <Tabs.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarIcon: ({focused}) => {
            const {Text} = require('react-native');
            return (
              <Text style={{fontSize: 20, opacity: focused ? 1 : 0.5}}>
                {tabIcons[route.name]}
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
        <Tabs.Screen name="Bank" component={BankConnectScreen} />
        <Tabs.Screen name="Settings">
          {props => <SettingsScreen {...props} themeMode={themeMode} onThemeModeChange={setThemeMode} />}
        </Tabs.Screen>
      </Tabs.Navigator>
    );
  }

  return (
    <ThemeProvider mode={themeMode} setMode={setThemeMode}>
      <SafeAreaProvider>
      <SafeAreaView style={{flex:1, backgroundColor: shellBg}}>
        <NavigationContainer theme={navTheme}>
          <Stack.Navigator
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
          <Stack.Screen name="Signup" component={SignupScreen} options={{title:'Create Your Account'}} />
          <Stack.Screen name="BankConnect" component={BankConnectScreen} options={{title:'Connect Your Bank'}} />

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

          <Stack.Screen name="AddPaycheck" component={AddPaycheckScreen} options={{title:'Your Pay Schedule'}} />
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
  );
}
