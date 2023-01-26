import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

type CredentialsStateT = {
  deviceId: string;
  deviceIdError: boolean;
  token: string;
  tokenError: boolean;
};

const useCredentials = () => {
  const [credentials, setCredentials] = useState<CredentialsStateT>({
    deviceId: '',
    deviceIdError: false,
    token: '',
    tokenError: false,
  });

  useEffect(() => {
    const getCredentials = async () => {
      let { deviceId, deviceIdError, token, tokenError } = credentials;
      try {
        deviceId = await SecureStore.getItemAsync('boreal-device-id');
        if (!deviceId) {
          deviceId = 'NONE';
        }
      } catch (_) {
        deviceIdError = true;
      }

      try {
        token = await SecureStore.getItemAsync('boreal-token');
        if (!token) {
          token = 'NONE';
        }
      } catch (_) {
        tokenError = true;
      }

      setCredentials({
        deviceId,
        deviceIdError,
        token,
        tokenError,
      });
    };

    getCredentials();
  }, [credentials]);

  return credentials;
};

export default useCredentials;
