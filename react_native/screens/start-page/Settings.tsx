import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLogout } from '../../api/mutations/useLogout';
import { useCheckToken } from '../../api/queries/useCheckToken';
import { useToken } from '../../api/queries/useToken';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { type SettingsProps } from '../../navigators/screen-types';
import { useOrdersContext } from '../../providers/OrdersProvider';
import { useReceiptsContext } from '../../providers/ReceiptsProvider';
import { useSellFlowContext } from '../../providers/SellFlowProvider';
import { useStorageFlowContext } from '../../providers/StorageFlowProvider';
import { useStorageContext } from '../../providers/StorageProvider';

export function Settings({ navigation }: SettingsProps) {
  const { data: user, isFetching: isUserFetching } = useCheckToken();
  const { data: { isTokenExpired } = {} } = useToken();
  const { mutateAsync: logout } = useLogout();

  const { resetOrdersContext } = useOrdersContext();
  const { resetReceiptsContext } = useReceiptsContext();
  const { clearStorageFromContext } = useStorageContext();
  const { resetStorageFlowContext } = useStorageFlowContext();
  const { resetSellFlowContext } = useSellFlowContext();
  const queryClient = useQueryClient();

  const isRoundStarted = user?.state === 'R';

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

    await clearStorageFromContext();
    await resetReceiptsContext();
    await resetOrdersContext();
    resetStorageFlowContext();
    await resetSellFlowContext();
    queryClient.resetQueries();

    setIsLoading(false);
  };

  if (isLoading || isUserFetching) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      {isTokenExpired && (
        <Button variant="neutral" onPress={loginHandler}>
          Bejelentkezés
        </Button>
      )}

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

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    paddingHorizontal: '10%',
    paddingTop: 30,
    rowGap: 30,
  },
});
