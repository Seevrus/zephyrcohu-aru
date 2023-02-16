import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';
import { Provider } from 'react-redux';

import store from './react_native/store';

import Loading from './react_native/components/Loading';
import colors from './react_native/constants/colors';
import fontSizes from './react_native/constants/fontSizes';
import EndErrand from './react_native/screens/errand-administration/EndErrand';
import StartErrand from './react_native/screens/errand-administration/StartErrand';
import StartupError from './react_native/screens/errors/StartupError';
import Receipt from './react_native/screens/receipts/Receipt';
import ReceiptList from './react_native/screens/receipts/ReceiptList';
import { PartnerList, PartnerTabParams, StackParams } from './react_native/screens/screen-types';
import Review from './react_native/screens/sell/Review';
import SelectItems from './react_native/screens/sell/select-items/SelectItems';
import SelectPartner from './react_native/screens/sell/SelectPartner';
import Summary from './react_native/screens/sell/Summary';
import Index from './react_native/screens/start-page/Index';
import RegisterDevice from './react_native/screens/startup/RegisterDevice';
import StartupCheck from './react_native/screens/startup/StartupCheck';

const Stack = createNativeStackNavigator<StackParams>();
const PartnerTab = createBottomTabNavigator<PartnerTabParams>();

function Settings() {
  return (
    <Pressable style={({ pressed }) => [pressed && { opacity: 0.75 }]}>
      <MaterialIcons name="settings" size={36} color="white" />
    </Pressable>
  );
}

function Partners() {
  const storePartnersIcon = ({ color }) => <MaterialIcons name="store" size={30} color={color} />;

  const allPartnersIcon = ({ color }) => (
    <MaterialIcons name="all-inclusive" size={30} color={color} />
  );

  return (
    <PartnerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: colors.neutral,
        },
        tabBarActiveTintColor: colors.blue200,
        tabBarInactiveTintColor: 'white',
        tabBarLabelStyle: {
          fontSize: fontSizes.footer,
        },
      }}
    >
      <PartnerTab.Screen
        name="SelectPartnerFromStore"
        component={SelectPartner}
        options={{ title: 'Kör Partnerei', tabBarIcon: storePartnersIcon }}
        initialParams={{
          partners: PartnerList.STORE,
        }}
      />
      <PartnerTab.Screen
        name="SelectPartnerFromAll"
        component={SelectPartner}
        options={{
          title: 'Összes partner',
          tabBarIcon: allPartnersIcon,
        }}
        initialParams={{
          partners: PartnerList.ALL,
        }}
      />
    </PartnerTab.Navigator>
  );
}

function Main() {
  const [fontsLoaded] = useFonts({
    Muli: require('./react_native/assets/fonts/Muli.ttf'),
    'Roboto-Regular': require('./react_native/assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('./react_native/assets/fonts/Roboto-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.neutral,
            },
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Roboto-Bold',
              fontSize: fontSizes.title,
            },
            headerTintColor: 'white',
          }}
        >
          <Stack.Screen
            name="StartupCheck"
            component={StartupCheck}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StartupError"
            component={StartupError}
            options={{ headerTitle: 'Hiba!' }}
          />
          <Stack.Screen
            name="RegisterDevice"
            component={RegisterDevice}
            options={{ headerTitle: 'Zephyr Boreal' }}
          />
          <Stack.Screen
            name="Index"
            component={Index}
            options={{
              headerTitle: 'Kör képernyő',
              headerRight: Settings,
            }}
          />
          <Stack.Screen
            name="SelectPartner"
            component={Partners}
            options={{
              headerTitle: 'Partner választása',
            }}
          />
          <Stack.Screen
            name="SelectItems"
            component={SelectItems}
            options={{
              headerTitle: 'Tételek',
            }}
          />
          <Stack.Screen
            name="Review"
            component={Review}
            options={{
              headerTitle: 'Áttekintés',
            }}
          />
          <Stack.Screen
            name="Summary"
            component={Summary}
            options={{
              headerTitle: 'Összegzés',
            }}
          />
          <Stack.Screen
            name="ReceiptList"
            component={ReceiptList}
            options={{
              headerTitle: 'Bizonylatok',
            }}
          />
          <Stack.Screen
            name="Receipt"
            component={Receipt}
            options={{
              headerTitle: '',
            }}
          />
          <Stack.Screen
            name="StartErrand"
            component={StartErrand}
            options={{
              headerTitle: 'Kör indítása',
            }}
          />
          <Stack.Screen
            name="EndErrand"
            component={EndErrand}
            options={{
              headerTitle: 'Kör zárása',
            }}
          />
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
