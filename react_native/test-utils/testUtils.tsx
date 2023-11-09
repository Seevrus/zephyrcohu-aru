import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { useFonts } from 'expo-font';
import { type FunctionComponent } from 'react';

import { Loading } from '../components/Loading';

export function renderStack(
  screens: {
    name: string;
    component: FunctionComponent;
    options?: NativeStackNavigationOptions;
  }[]
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Number.POSITIVE_INFINITY,
      },
    },
  });

  const Stack = createNativeStackNavigator();

  function TestApp() {
    const [fontsLoaded] = useFonts({
      'Nunito-Sans': NunitoSans_400Regular,
      'Roboto-Regular': Roboto_400Regular,
      'Roboto-Bold': Roboto_700Bold,
    });

    if (!fontsLoaded) {
      return <Loading />;
    }

    return (
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          {screens.map((screen) => (
            <Stack.Screen
              key={screen.name}
              name={screen.name}
              component={screen.component}
              options={screen.options}
            />
          ))}
        </NavigationContainer>
      </QueryClientProvider>
    );
  }

  return render(<TestApp />);
}
