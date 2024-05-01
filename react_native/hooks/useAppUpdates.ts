import { useNetInfo } from '@react-native-community/netinfo';
import { checkForUpdateAsync } from 'expo-updates';
import { useCallback, useEffect, useState } from 'react';

import { type AlertButton } from '../components/alert/Alert';

type UseAppUpdates = {
  alert?: {
    isAlertVisible: boolean;
    alertTitle: string;
    alertMessage: string | null;
    cancelButton: AlertButton | null;
    onBackdropPress: () => void;
  };
};

export function useAppUpdates(): UseAppUpdates {
  const { isInternetReachable } = useNetInfo();

  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [lastChecked, setLastChecked] = useState(0);

  useEffect(() => {
    if (
      process.env.EXPO_PUBLIC_IS_DEV === 'no' &&
      isInternetReachable === true &&
      Date.now() - lastChecked > 1 * 24 * 60 * 60 * 1000
    ) {
      checkForUpdateAsync().then(({ isAvailable }) => {
        setIsUpdateAvailable(isAvailable);
        setLastChecked(Date.now());
      });
    }
  }, [isInternetReachable, lastChecked]);

  const resetAlertHandler = useCallback(() => {
    setIsUpdateAvailable(false);
  }, []);

  return {
    alert: isUpdateAvailable
      ? {
          isAlertVisible: isUpdateAvailable,
          alertTitle: 'Frissítés érhető el',
          alertMessage:
            'Új programverzió érhető el. Kérem, frissítse a programot a Play Áruházban.',
          cancelButton: {
            text: 'Értem',
            variant: 'neutral',
            onPress: resetAlertHandler,
          },
          onBackdropPress: resetAlertHandler,
        }
      : undefined,
  };
}
