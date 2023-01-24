import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';

import Loading from './react_native/components/Loading';
import colors from './react_native/constants/colors';
import fontSizes from './react_native/constants/fontSizes';
import Index from './react_native/screens/Index';
import Login from './react_native/screens/startup/Login';
import StartupCheck from './react_native/screens/startup/StartupCheck';
import store from './react_native/store';

const Stack = createNativeStackNavigator();

// Kezdünk egy képernyőn, ami nézetileg csak egy spinner. Ez legelőször bekéri a tokent.
// Ha nincs token, lecseréli magát a Regisztrációs kpépernyőre
// Ha van token, akkor bekéri a telefonszámot.
// Ha erre nincs engedélye, lecseréli magát egy hibaüzenetre, ahol újra lehet engedélyt adni.
// Ha van engedélye, ellenőrzi a tokent.
// Ha a token nem jó, lecseréli magát a regisztrációs képernyőre (vagy annak egy változatára)
// Ha a token jó, akkor jutunk el a tényleges App képernyőre.

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
              backgroundColor: colors.purple800,
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
          <Stack.Screen name="Login" component={Login} options={{ headerTitle: 'Zephyr Boreal' }} />
          <Stack.Screen name="Index" component={Index} options={{ headerTitle: 'Kör képernyő' }} />
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
