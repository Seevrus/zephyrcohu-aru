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

  function getCredentials() {
    SecureStore.getItemAsync('boreal-device-id')
      .then((storedDeviceId) => {
        if (!storedDeviceId) {
          setCredentials((prev) => ({
            ...prev,
            deviceId: 'NONE',
          }));
        } else {
          setCredentials((prev) => ({
            ...prev,
            deviceId: storedDeviceId,
          }));

          SecureStore.getItemAsync('boreal-token')
            .then((storedToken) => {
              if (!storedToken) {
                setCredentials((prev) => ({
                  ...prev,
                  token: 'NONE',
                }));
              } else {
                setCredentials((prev) => ({
                  ...prev,
                  token: storedToken,
                }));
              }
            })
            .catch(() => {
              setCredentials((prev) => ({
                ...prev,
                tokenError: true,
              }));
            });
        }
      })
      .catch(() => {
        setCredentials((prev) => ({
          ...prev,
          deviceIdError: true,
        }));
      });
  }

  useEffect(() => {
    getCredentials();
  }, []);

  return credentials;
};

export default useCredentials;
