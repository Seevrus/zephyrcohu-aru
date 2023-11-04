import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLogout } from '../../api/mutations/useLogout';
import { checkTokenAtom } from '../../api/queries/useCheckToken';
import { tokenAtom } from '../../api/queries/useToken';
import {
  primaryStoreAtom,
  selectedStoreAtom,
  selectedStoreInitialStateAtom,
} from '../../atoms/storage';
import {
  isStorageSavedToApiAtom,
  storageListItemsAtom,
} from '../../atoms/storageFlow';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { type SettingsProps } from '../../navigators/screen-types';

export function Settings({ navigation }: SettingsProps) {
  const { data: user, isFetching: isUserFetching } =
    useAtomValue(checkTokenAtom);
  const { data: tokenData } = useAtomValue(tokenAtom);
  const { mutateAsync: logout } = useLogout();

  const queryClient = useQueryClient();

  const isRoundStarted = user?.state === 'R';

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

    setPrimaryStore(null);
    setSelectedStoreInitialState(null);
    setSelectedStore(null);

    setIsStorageSavedToApi(false);
    setStorageListItems(undefined);

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

  if (isLoading || isUserFetching || !tokenData) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {tokenData.isTokenExpired && (
        <Button variant="neutral" onPress={loginHandler}>
          Bejelentkezés
        </Button>
      )}

      {!tokenData.isTokenExpired && (
        <Button variant="neutral" onPress={changePasswordHandler}>
          Jelszó megváltoztatása
        </Button>
      )}
      {!tokenData.isTokenExpired && !isRoundStarted && (
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: '10%',
    paddingTop: 30,
    rowGap: 30,
  },
});
