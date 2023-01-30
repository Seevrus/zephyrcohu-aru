import { useEffect } from 'react';

import useLocalStorage from '../../hooks/useLocalStorage';
import useToken from '../../hooks/useToken';

import Loading from '../../components/Loading';
import { StartupCheckProps } from '../screen-types';

export default function StartupCheck({ navigation }: StartupCheckProps) {
  const { deviceId, token, credentialsAvailable, tokenStorageError } = useToken();
  const [isLocalStateMerged, localStateError] = useLocalStorage(credentialsAvailable);

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

    if (isLocalStateMerged) {
      navigation.replace('Index');
    }
  }, [deviceId, isLocalStateMerged, localStateError, navigation, token, tokenStorageError]);

  return <Loading />;
}
