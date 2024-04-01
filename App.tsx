import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
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
import { Provider as AtomsProvider } from 'jotai/react';

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

export default function App() {
  const [fontsLoaded] = useFonts({
    'Nunito-Sans': NunitoSans_400Regular,
    'Roboto-Regular': Roboto_400Regular,
    'Roboto-Bold': Roboto_700Bold,
  });

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <AtomsProvider>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </AtomsProvider>
      <StatusBar style="light" />
    </PersistQueryClientProvider>
  );
}
