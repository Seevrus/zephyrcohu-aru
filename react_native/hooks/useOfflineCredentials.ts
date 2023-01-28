import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

const useOfflineCredentials = () => {
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceIdError, setDeviceIdError] = useState<boolean>(false);
  const [token, setToken] = useState<string>('');
  const [tokenError, setTokenError] = useState<boolean>(false);

  useEffect(() => {
    const getCredentials = async () => {
      console.log('Getting token from storage');
      try {
        const storedDeviceId = await SecureStore.getItemAsync('boreal-device-id');
        setDeviceId(storedDeviceId ?? 'NONE');
      } catch (_) {
        setDeviceIdError(true);
      }

      try {
        const storedToken = await SecureStore.getItemAsync('boreal-token');
        setToken(storedToken ?? 'NONE');
      } catch (_) {
        setTokenError(true);
      }
    };

    getCredentials();
  }, []);

  return { deviceId, deviceIdError, token, tokenError };
};

export default useOfflineCredentials;
