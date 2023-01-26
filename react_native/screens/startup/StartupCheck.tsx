import { useEffect } from 'react';

import useOfflineCredentials from '../../hooks/useOfflineCredentials';

import Loading from '../../components/Loading';
import { StartupCheckProps } from '../screen-types';

export default function StartupCheck({ navigation }: StartupCheckProps) {
  const credentials = useOfflineCredentials();

  useEffect(() => {
    if (credentials.deviceIdError || credentials.tokenError) {
      navigation.replace('StartupError', {
        message: 'Váratlan hiba lépett fel az azonosító adatok betöltése során.',
      });
    }

    if (credentials.deviceId === 'NONE' && credentials.token === 'NONE') {
      navigation.replace('RegisterDevice');
    } else if (credentials.deviceId === 'NONE' || credentials.token === 'NONE') {
      navigation.replace('StartupError', {
        message: 'Az Ön bejelentkezési adatai kompromittálódtak ezen az eszközön.',
      });
    }

    navigation.navigate('Index');
  }, [
    credentials.deviceId,
    credentials.deviceIdError,
    credentials.token,
    credentials.tokenError,
    navigation,
  ]);

  return <Loading />;
}
