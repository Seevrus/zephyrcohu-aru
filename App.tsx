/* eslint-disable unicorn/prefer-module */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addEventListener as NetInfoAddEventListener } from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  QueryClient,
  keepPreviousData,
  onlineManager,
} from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { queryClientAtom } from 'jotai-tanstack-query';
import { Provider } from 'jotai/react';
import { useHydrateAtoms } from 'jotai/react/utils';
import { type PropsWithChildren } from 'react';

import { Loading } from './react_native/components/Loading';
import { MainStack } from './react_native/navigators/MainStack';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

onlineManager.setEventListener((setOnline) =>
  NetInfoAddEventListener((state) => {
    setOnline(!!state.isConnected);
  })
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      placeholderData: keepPreviousData,
      staleTime: Number.POSITIVE_INFINITY,
      retry: 3,
    },
  },
});

const HydrateAtoms = ({ children }: PropsWithChildren) => {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return children;
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Muli: require('./react_native/assets/fonts/Muli.ttf'),
    'Roboto-Regular': require('./react_native/assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Bold': require('./react_native/assets/fonts/Roboto-Bold.ttf'),
  });

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <Provider>
        <HydrateAtoms>
          <StatusBar style="auto" />
          <NavigationContainer>
            <MainStack />
          </NavigationContainer>
        </HydrateAtoms>
      </Provider>
    </PersistQueryClientProvider>
  );
}
