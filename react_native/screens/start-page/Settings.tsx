import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import useLogout from '../../api/mutations/useLogout';
import useCheckToken from '../../api/queries/useCheckToken';
import useToken from '../../api/queries/useToken';
import Loading from '../../components/Loading';
import Button from '../../components/ui/Button';
import colors from '../../constants/colors';
import { SettingsProps } from '../../navigators/screen-types';

export default function Settings({ navigation }: SettingsProps) {
  const { data: user, isFetching: isUserFetching } = useCheckToken();
  const {
    data: { isTokenExpired },
  } = useToken();
  const { mutateAsync: logout } = useLogout();

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 30,
    paddingHorizontal: '10%',
    rowGap: 30,
  },
});
