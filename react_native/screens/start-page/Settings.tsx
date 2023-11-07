import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import { Suspense, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLogout } from '../../api/mutations/useLogout';
import { useCheckToken } from '../../api/queries/useCheckToken';
import { currentOrderAtom, ordersAtom } from '../../atoms/orders';
import { currentReceiptAtom, receiptsAtom } from '../../atoms/receipts';
import {
  primaryStoreAtom,
  selectedStoreAtom,
  selectedStoreInitialStateAtom,
} from '../../atoms/storage';
import {
  isStorageSavedToApiAtom,
  storageListItemsAtom,
} from '../../atoms/storageFlow';
import { tokenAtom } from '../../atoms/token';
import { Loading } from '../../components/Loading';
import { Container } from '../../components/container/Container';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { useResetSellFlow } from '../../hooks/sell/useResetSellFlow';
import { type SettingsProps } from '../../navigators/screen-types';

function SuspendedSettings({ navigation }: SettingsProps) {
  const { data: user, isFetching: isUserFetching } = useCheckToken();
  const { mutateAsync: logout } = useLogout();

  const { token, isTokenExpired } = useAtomValue(tokenAtom);

  const queryClient = useQueryClient();

  const resetSellFlow = useResetSellFlow();

  const isRoundStarted = user?.state === 'R';

  const [, setCurrentOrder] = useAtom(currentOrderAtom);
  const [, setCurrentReceipt] = useAtom(currentReceiptAtom);
  const [, setOrders] = useAtom(ordersAtom);
  const [, setReceipts] = useAtom(receiptsAtom);
  const [, setPrimaryStore] = useAtom(primaryStoreAtom);
  const [, setSelectedStoreInitialState] = useAtom(
    selectedStoreInitialStateAtom
  );
  const [, setSelectedStore] = useAtom(selectedStoreAtom);

  const [, setIsStorageSavedToApi] = useAtom(isStorageSavedToApiAtom);
  const [, setStorageListItems] = useAtom(storageListItemsAtom);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loginHandler = () => {
    navigation.replace('Login');
  };

  const changePasswordHandler = () => {
    navigation.navigate('ChangePassword');
  };

  const logoutHandler = async () => {
    setIsLoading(true);
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Index' }],
    });
  };

  const resetHandler = async () => {
    setIsLoading(true);

    await setPrimaryStore(null);
    await setSelectedStoreInitialState(null);
    await setSelectedStore(null);

    setIsStorageSavedToApi(false);
    setStorageListItems(null);

    await setCurrentOrder(null);
    await setCurrentReceipt(null);
    await setOrders([]);
    await setReceipts([]);

    await resetSellFlow();

    await queryClient.invalidateQueries({ queryKey: ['active-round'] });
    await queryClient.resetQueries({ queryKey: ['check-token'] });
    await queryClient.resetQueries({ queryKey: ['token'] });
    await queryClient.invalidateQueries({ queryKey: ['items'] });
    await queryClient.invalidateQueries({ queryKey: ['other-items'] });
    await queryClient.invalidateQueries({ queryKey: ['partner-lists'] });
    await queryClient.invalidateQueries({ queryKey: ['partners'] });
    await queryClient.invalidateQueries({ queryKey: ['price-lists'] });
    await queryClient.invalidateQueries({ queryKey: ['search-tax-number'] });
    await queryClient.invalidateQueries({ queryKey: ['store-details'] });
    await queryClient.invalidateQueries({ queryKey: ['stores'] });

    await AsyncStorage.removeItem('boreal-user-backup');

    navigation.reset({
      index: 0,
      routes: [{ name: 'Index' }],
    });
  };

  if (isLoading || isUserFetching || !token) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {isTokenExpired ? (
        <Button variant="neutral" onPress={loginHandler}>
          Bejelentkezés
        </Button>
      ) : null}

      {!isTokenExpired && (
        <Button variant="neutral" onPress={changePasswordHandler}>
          Jelszó megváltoztatása
        </Button>
      )}
      {!isTokenExpired && !isRoundStarted && (
        <Button variant="neutral" onPress={logoutHandler}>
          Kijelentkezés
        </Button>
      )}
      <Button variant="warning" onPress={resetHandler}>
        Reset (béta teszthez)
      </Button>
    </View>
  );
}

export function Settings(props: SettingsProps) {
  return (
    <Suspense fallback={<Container />}>
      <SuspendedSettings {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: '10%',
    paddingTop: 30,
    rowGap: 30,
  },
});
