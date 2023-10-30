/* eslint-disable unicorn/prefer-module */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addEventListener as NetInfoAddEventListener } from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  keepPreviousData,
  onlineManager,
  QueryClient,
} from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import { useToken } from './react_native/api/queries/useToken';
import { Loading } from './react_native/components/Loading';
import { MainStack } from './react_native/navigators/MainStack';
import { OrdersProvider } from './react_native/providers/OrdersProvider';
import { ReceiptsProvider } from './react_native/providers/ReceiptsProvider';
import { SellFlowProvider } from './react_native/providers/SellFlowProvider';
import { StorageFlowProvider } from './react_native/providers/StorageFlowProvider';
import { StorageProvider } from './react_native/providers/StorageProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: Number.POSITIVE_INFINITY,
      placeholderData: keepPreviousData,
      staleTime: Number.POSITIVE_INFINITY,
      retry: 3,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

onlineManager.setEventListener((setOnline) =>
  NetInfoAddEventListener((state) => {
    setOnline(!!state.isConnected);
  })
);

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
        <MainStack />
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
      <StorageProvider>
        <StorageFlowProvider>
          <OrdersProvider>
            <ReceiptsProvider>
              <SellFlowProvider>
                <Main />
              </SellFlowProvider>
            </ReceiptsProvider>
          </OrdersProvider>
        </StorageFlowProvider>
      </StorageProvider>
    </PersistQueryClientProvider>
  );
}
