import { MaterialIcons } from '@expo/vector-icons';
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
import StartupError from './react_native/screens/errors/StartupError';
import Index from './react_native/screens/Index';
import { StackParams } from './react_native/screens/screen-types';
import RegisterDevice from './react_native/screens/startup/RegisterDevice';
import StartupCheck from './react_native/screens/startup/StartupCheck';

const Stack = createNativeStackNavigator<StackParams>();

function Settings() {
  return (
    <Pressable style={({ pressed }) => [pressed && { opacity: 0.75 }]}>
      <MaterialIcons name="settings" size={36} color="white" />
    </Pressable>
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
            name="StartupError"
            component={StartupError}
            options={{ headerTitle: 'Hiba!' }}
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
