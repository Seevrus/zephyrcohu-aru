import { useNetInfo } from '@react-native-community/netinfo';
import { useEffect } from 'react';

import useCheckToken from '../../hooks/useCheckToken';
import useLocalStorage from '../../hooks/useLocalStorage';
import useToken from '../../hooks/useToken';

import Loading from '../../components/Loading';
import { StartupCheckProps } from '../screen-types';

export default function StartupCheck({ navigation }: StartupCheckProps) {
  const { isInternetReachable } = useNetInfo();
  const { deviceId, token, isTokenAvailable, tokenStorageError } = useToken();
  const [isLocalStateMerged, localStateError] = useLocalStorage(
    isTokenAvailable && !tokenStorageError
  );
  const [isTokenValid, tokenValidationError] = useCheckToken(
    isInternetReachable,
    isTokenAvailable && !tokenStorageError,
    deviceId,
    token
  );

  useEffect(() => {
    if (tokenStorageError) {
      navigation.replace('StartupError', {
        message: 'Váratlan hiba lépett fel az azonosító adatok betöltése során.',
      });
      return;
    }

    if (deviceId === 'NONE' && token === 'NONE') {
      navigation.replace('RegisterDevice');
      return;
    }

    if (localStateError) {
      navigation.replace('StartupError', {
        message: 'Váratlan hiba lépett fel a kör adatainak betöltése során.',
      });
      return;
    }

    if (tokenValidationError) {
      navigation.replace('StartupError', {
        message: 'A korábban megadott bejelentkezési adatok hitelesítése sikertelen.',
      });
      return;
    }

    if (isLocalStateMerged && isTokenValid) {
      navigation.replace('Index');
    }
  }, [
    deviceId,
    isLocalStateMerged,
    isTokenValid,
    localStateError,
    navigation,
    token,
    tokenStorageError,
    tokenValidationError,
  ]);

  return <Loading />;
}
