import 'react-native-gesture-handler';
import React, {useState} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();

export default function App(){
  const [userName] = useState('Alex');
  const [bills, setBills] = useState([
    {id:1,name:'Light Bill',amount:150,saved:38,due:15,frequency:'Monthly'},
    {id:2,name:'Phone Bill',amount:90,saved:22,due:2,frequency:'Monthly'},
    {id:3,name:'Rent',amount:1250,saved:250,due:1,frequency:'Monthly'}
  ]);

  function addBill(b){
    setBills(prev=>[...prev,{...b,id:Date.now()}]);
  }
  function updateBill(updated){
    setBills(prev=>prev.map(b=>b.id===updated.id?updated:b));
  }
  function deleteBill(id){
    setBills(prev=>prev.filter(b=>b.id!==id));
  }

  function MainTabs(){
    return (
      <Tabs.Navigator screenOptions={{headerShown:false}}>
        <Tabs.Screen name="Home" children={()=>(<DashboardScreen userName={userName} bills={bills} />)} />
        <Tabs.Screen name="Bills" children={()=>(<AutoPayScreen bills={bills} />)} />
        <Tabs.Screen name="Calendar" children={()=>(<CalendarScreen bills={bills} />)} />
        <Tabs.Screen name="Settings" component={SettingsScreen} />
      </Tabs.Navigator>
    );
  }

  return (
    <SafeAreaView style={{flex:1}}>
      <NavigationContainer>
        <Stack.Navigator>
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
            {props => <BillDetailsScreen {...props} onDelete={(id)=>{deleteBill(id); props.navigation.navigate('Main');}} onSave={updateBill} />}
          </Stack.Screen>

          <Stack.Screen name="AddPaycheck" component={AddPaycheckScreen} options={{title:'Your Pay Schedule'}} />
          <Stack.Screen name="Savings" options={{title:'Savings Breakdown'}}>
            {props => <SavingsBreakdownScreen {...props} bills={bills} />}
          </Stack.Screen>
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Help" component={HelpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
