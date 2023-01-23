import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import Loading from '../../components/Loading';

export default function StartupCheck({ navigation }) {
  useEffect(() => {
    SecureStore.getItemAsync('borrel-token').then((token) => {
      if (!token) {
        navigation.replace('Login');
      }
    });
  }, [navigation]);

  return <Loading />;
}
