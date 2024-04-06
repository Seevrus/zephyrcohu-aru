import { NunitoSans_400Regular } from '@expo-google-fonts/nunito-sans';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import {
  QueryClient,
  focusManager,
  keepPreviousData,
} from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Provider as AtomsProvider } from 'jotai/react';
import { Platform, type AppStateStatus } from 'react-native';

import { Loading } from './react_native/components/Loading';
import { useAppState } from './react_native/hooks/useAppState';
import { useOnlineManager } from './react_native/hooks/useOnlineManager';
import { MainStack } from './react_native/navigators/MainStack';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      placeholderData: keepPreviousData,
      staleTime: Number.POSITIVE_INFINITY,
      retry: 3,
    },
  },
});

function onAppStateChange(status: AppStateStatus) {
  // React Query already supports in web browser refetch on window focus by default
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export default function App() {
  useOnlineManager();
  useAppState(onAppStateChange);

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
