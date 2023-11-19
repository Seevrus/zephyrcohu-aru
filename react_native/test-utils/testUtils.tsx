/* eslint-disable @typescript-eslint/no-explicit-any */
import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import {
  QueryClient,
  QueryClientProvider,
  keepPreviousData,
} from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { useFonts } from 'expo-font';
import { type WritableAtom } from 'jotai';
import { Provider as AtomsProvider } from 'jotai/react';
import { useHydrateAtoms } from 'jotai/utils';
import { type HttpHandler } from 'msw';
import { setupServer } from 'msw/node';
import { mergeRight, values } from 'ramda';
import { type FunctionComponent, type PropsWithChildren } from 'react';

import { receiptsAtom } from '../atoms/receipts';
import { Loading } from '../components/Loading';
import { colors } from '../constants/colors';
import { fontSizes } from '../constants/fontSizes';

// eslint-disable-next-line import/no-unused-modules
export const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      placeholderData: keepPreviousData,
      staleTime: Number.POSITIVE_INFINITY,
      retry: false,
    },
  },
});

type InitialAtomValue = [WritableAtom<any, any, any>, any];
export type InitialAtoms = Record<string, InitialAtomValue>;

function HydrateAtoms({
  initialValues,
  children,
}: PropsWithChildren<{ initialValues?: InitialAtomValue[] }>) {
  useHydrateAtoms(initialValues ?? []);
  return children;
}

export function renderStack(
  screens: {
    name: string;
    component: FunctionComponent;
    options?: NativeStackNavigationOptions;
  }[],
  initialAtoms?: InitialAtoms
) {
  const defaultAtoms: InitialAtoms = { receipts: [receiptsAtom, []] };
  const initialAtomValues = values(
    mergeRight(defaultAtoms, initialAtoms ?? {})
  );

  function TestAtomsProvider({
    initialValues,
    children,
  }: PropsWithChildren<{ initialValues?: InitialAtomValue[] }>) {
    return (
      <AtomsProvider>
        <HydrateAtoms initialValues={initialValues}>{children}</HydrateAtoms>
      </AtomsProvider>
    );
  }

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
      <QueryClientProvider client={testQueryClient}>
        <TestAtomsProvider initialValues={initialAtomValues}>
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
              {screens.map((screen) => (
                <Stack.Screen
                  key={screen.name}
                  name={screen.name}
                  component={screen.component}
                  options={screen.options}
                />
              ))}
            </Stack.Navigator>
          </NavigationContainer>
        </TestAtomsProvider>
      </QueryClientProvider>
    );
  }

  return render(<TestApp />);
}

export function useServer(...requestHandlers: HttpHandler[]) {
  const server = setupServer(...requestHandlers);

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  return server;
}
