import { useEffect } from 'react';

import useCredentials from '../../hooks/useCredentials';
// import { checkToken } from '../../store/config-slice/config-slice';
// import { useAppDispatch } from '../../store/hooks';

import Loading from '../../components/Loading';
import { StartupCheckProps } from '../screen-types';

export default function StartupCheck({ navigation }: StartupCheckProps) {
  // const dispatch = useAppDispatch();
  const credentials = useCredentials();

  useEffect(() => {
    if (credentials.deviceIdError || credentials.tokenError) {
      navigation.replace('StartupError', {
        message: 'Váratlan hiba lépett fel az azonosító adatok betöltése során.',
      });
    }

    if (credentials.deviceId === 'NONE' && credentials.token === 'NONE') {
      // még nem regisztrált, megyünk a regisztrációs képernyőre
    } else if (credentials.deviceId === 'NONE' || credentials.token === 'NONE') {
      navigation.replace('StartupError', {
        message: 'Az Ön bejelentkezési adatai kompromittálódtak ezen az eszközön.',
      });
    }
    // Különben jöhet a token ellenőrzés
  }, [
    credentials.deviceId,
    credentials.deviceIdError,
    credentials.token,
    credentials.tokenError,
    navigation,
  ]);

  return <Loading />;
}
