import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import EndErrand from './react_native/screens/errand-administration/EndErrand';
import StartErrand from './react_native/screens/errand-administration/StartErrand';
import Index from './react_native/screens/Index';
import Receipt from './react_native/screens/receipts/Receipt';
import ReceiptList from './react_native/screens/receipts/ReceiptList';
import Review from './react_native/screens/sell/Review';
import SelectGoods from './react_native/screens/sell/SelectGoods';
import SelectPartner from './react_native/screens/sell/SelectPartner';
import Summary from './react_native/screens/sell/Summary';
import Setup from './react_native/screens/startup/Setup';
import StartupCheck from './react_native/screens/startup/StartupCheck';
import store from './react_native/store';

const Stack = createNativeStackNavigator();

function Main() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Setup" component={Setup} />
          <Stack.Screen name="StartupCheck" component={StartupCheck} />
          <Stack.Screen name="Index" component={Index} />
          <Stack.Screen name="SelectPartner" component={SelectPartner} />
          <Stack.Screen name="SelectGoods" component={SelectGoods} />
          <Stack.Screen name="Review" component={Review} />
          <Stack.Screen name="Summary" component={Summary} />
          <Stack.Screen name="ReceiptList" component={ReceiptList} />
          <Stack.Screen name="Receipt" component={Receipt} />
          <Stack.Screen name="StartErrand" component={StartErrand} />
          <Stack.Screen name="EndErrand" component={EndErrand} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}
