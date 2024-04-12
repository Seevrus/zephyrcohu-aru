import { useAtomValue } from 'jotai';
import { Suspense, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLogout } from '../../api/mutations/useLogout';
import { useCheckToken } from '../../api/queries/useCheckToken';
import { tokenAtom } from '../../atoms/token';
import { Container } from '../../components/container/Container';
import { Loading } from '../../components/Loading';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { type SettingsProps } from '../../navigators/screen-types';

function SuspendedSettings({ navigation }: SettingsProps) {
  const { data: user, isFetching: isUserFetching } = useCheckToken();
  const { mutateAsync: logout } = useLogout();

  const { isTokenExpired } = useAtomValue(tokenAtom);

  const isUserIdle = user?.state === 'I';

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

  if (isLoading || isUserFetching) {
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
      {!isTokenExpired && isUserIdle ? (
        <Button variant="neutral" onPress={logoutHandler}>
          Kijelentkezés
        </Button>
      ) : null}
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
