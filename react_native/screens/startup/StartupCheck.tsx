import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';

import { useAppDispatch } from '../../store/hooks';
import { checkToken } from '../../store/config-slice/config-slice';

import Loading from '../../components/Loading';

export default function StartupCheck({ navigation }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeStartupCheck = async () => {
      try {
        const token = SecureStore.getItemAsync('boreal-token');
        if (!token) {
          navigation.replace('Login');
        }
      } catch (err) {
        // Váratlan hiba lépett fel az eszközazonosító elérése során.
        // Ezzel a hibával térjünk át az AppStartupError képernyőre, ami még nincs is.
        return;
      }

      try {
        dispatch(checkToken);
        // Itt kellene visszaállítani a korábban elmentett state-et együttvéve, mindenestül.
        // Utána pedig elmenni az Index oldalra.
      } catch (err) {
        // A hibaüzenettel menjünk át a startuperror részre.
      }
    };

    initializeStartupCheck();
  }, [dispatch, navigation]);

  return <Loading />;
}
