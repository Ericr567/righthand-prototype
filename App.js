import 'react-native-gesture-handler';
import React, {useState, useMemo} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
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

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();

export default function App(){
  const [bills, setBills] = useState([
    {id:1,name:'Light Bill',amount:150,due:15,frequency:'Monthly',autoPay:true},
    {id:2,name:'Phone Bill',amount:90,due:2,frequency:'Monthly',autoPay:true},
    {id:3,name:'Rent',amount:1250,due:1,frequency:'Monthly',autoPay:true}
  ]);

  // Transaction history — this is the source of truth for how much has been saved per bill
  const [transactions, setTransactions] = useState([
    {id:1, billId:1, amount:38,  date:'2026-03-01', note:'Auto savings transfer'},
    {id:2, billId:2, amount:22,  date:'2026-03-01', note:'Auto savings transfer'},
    {id:3, billId:3, amount:150, date:'2026-02-15', note:'Auto savings transfer'},
    {id:4, billId:3, amount:100, date:'2026-03-01', note:'Auto savings transfer'},
  ]);

  const [autoSave, setAutoSave] = useState({
    enabled: false,
    amountType: 'fixed',
    amount: 0,
    frequency: 'Bi-weekly',
    nextPayDate: '',
  });
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

  const tabIcons = {Home:'🏠', Bills:'📋', Calendar:'📅', Settings:'⚙️'};

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
          tabBarActiveTintColor: '#0B4226',
          tabBarInactiveTintColor: '#36454F',
          tabBarLabelStyle: {fontSize:11, fontFamily:'Inter', fontWeight:'600', marginBottom:2},
          tabBarStyle: {
            backgroundColor:'#F5EEE3',
            borderTopWidth:1,
            borderTopColor:'#9BB38C',
            paddingTop:6,
            height:62,
          },
        })}
      >
        <Tabs.Screen name="Home" children={()=>(<DashboardScreen bills={enrichedBills} autoSave={autoSave} />)} />
        <Tabs.Screen name="Bills">{props => <AutoPayScreen {...props} bills={enrichedBills} onToggleAutoPay={toggleBillAutoPay} />}</Tabs.Screen>
        <Tabs.Screen name="Calendar">{props => <CalendarScreen {...props} bills={enrichedBills} />}</Tabs.Screen>
        <Tabs.Screen name="Settings" component={SettingsScreen} />
      </Tabs.Navigator>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{flex:1}}>
        <NavigationContainer>
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
                      // after editing, go back to details view
                      props.navigation.navigate('BillDetails', {bill: b});
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
              const rawBill = props.route.params?.bill;
              const enriched = rawBill ? {...rawBill, saved: savedByBill[rawBill.id] || 0} : rawBill;
              const enrichedProps = {...props, route: {...props.route, params: {...props.route.params, bill: enriched}}};
              return <BillDetailsScreen
                {...enrichedProps}
                transactions={transactions.filter(tx => rawBill && tx.billId === rawBill.id)}
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
  );
}
