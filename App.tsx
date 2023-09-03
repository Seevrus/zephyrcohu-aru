import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { onlineManager, QueryClient } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import useToken from './react_native/api/queries/useToken';
import Loading from './react_native/components/Loading';
import colors from './react_native/constants/colors';
import fontSizes from './react_native/constants/fontSizes';
import OrdersProvider from './react_native/providers/OrdersProvider';
import ReceiptsProvider from './react_native/providers/ReceiptsProvider';
import StorageProvider from './react_native/providers/StorageProvider';
import UserProvider from './react_native/providers/UserProvider';
import Login from './react_native/screens/login/Login';
import { StackParams } from './react_native/screens/screen-types';
import ChangePassword from './react_native/screens/start-page/ChangePassword';
import Index from './react_native/screens/start-page/Index';
import Settings from './react_native/screens/start-page/Settings';
import SettingsButton from './react_native/screens/start-page/SettingsButton';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      keepPreviousData: false,
      staleTime: Infinity,
      retry: 3,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  })
);

const Stack = createNativeStackNavigator<StackParams>();
// const PartnerTab = createBottomTabNavigator<PartnerTabParams>();

/* function Partners() {
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
} */

function Main() {
  const [fontsLoaded] = useFonts({
    Muli: require('./react_native/assets/fonts/Muli.ttf'),
    'Roboto-Regular': require('./react_native/assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('./react_native/assets/fonts/Roboto-Bold.ttf'),
  });

  const { data: tokenData } = useToken();

  if (!fontsLoaded || !tokenData) {
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
            name="Index"
            component={Index}
            options={{
              headerTitle: 'Zephyr Boreal',
              headerRight: SettingsButton,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{ headerTitle: 'Beállítások' }}
          />
          <Stack.Screen name="Login" component={Login} options={{ headerTitle: 'Bejelentkezés' }} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePassword}
            options={{ headerTitle: 'Új jelszó' }}
          />
          {/*  <Stack.Screen
            name="SelectPartner"
            component={Partners}
            options={{
              headerTitle: 'Partner kiválasztása',
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
            name="ReceiptDetails"
            component={ReceiptDetails}
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
          /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <UserProvider>
        <StorageProvider>
          <OrdersProvider>
            <ReceiptsProvider>
              <Main />
            </ReceiptsProvider>
          </OrdersProvider>
        </StorageProvider>
      </UserProvider>
    </PersistQueryClientProvider>
  );
}
